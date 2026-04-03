import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class BirdClassifier(nn.Module):
    def __init__(self, num_classes=15):
        super(BirdClassifier, self).__init__()
        # Load pre-trained EfficientNet-B0
        self.backbone = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
        
        # Modify the first conv layer to accept 1 channel (grayscale spectrograms)
        # EfficientNet expects 3 channels originally.
        old_conv = self.backbone.features[0][0]
        self.backbone.features[0][0] = nn.Conv2d(
            in_channels=1, 
            out_channels=old_conv.out_channels,
            kernel_size=old_conv.kernel_size,
            stride=old_conv.stride,
            padding=old_conv.padding,
            bias=False
        )
        
        # Copy original weights for the first channel (averaging over 3 channels)
        with torch.no_grad():
            self.backbone.features[0][0].weight[:] = old_conv.weight.mean(dim=1, keepdim=True)
            
        # Freeze backbone elements to speed up training if desired
        # for param in self.backbone.parameters():
        #    param.requires_grad = False
            
        # Replace classifier head for multi-label classification
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier[1] = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_features, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)
