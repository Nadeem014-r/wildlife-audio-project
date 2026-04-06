import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class BirdClassifier(nn.Module):
    def __init__(self, num_classes=15):
        super(BirdClassifier, self).__init__()
        # Load pre-trained EfficientNet-B0
        self.backbone = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
            
        # Replace classifier head for multi-label classification
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier[1] = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_features, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)
