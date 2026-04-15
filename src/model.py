import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import efficientnet_b2, EfficientNet_B2_Weights


class AttentionPooling(nn.Module):
    """Lightweight channel attention over spatial features before classification."""
    def __init__(self, in_features):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(in_features, in_features // 4),
            nn.ReLU(),
            nn.Linear(in_features // 4, in_features),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x: (B, C) after adaptive avg pool
        return x * self.attn(x)


class BirdClassifier(nn.Module):
    def __init__(self, num_classes=15, dropout=0.3):
        super().__init__()
        # Upgraded to EfficientNet-B2: better accuracy, modest cost increase
        self.backbone = efficientnet_b2(weights=EfficientNet_B2_Weights.DEFAULT)

        in_features = self.backbone.classifier[1].in_features

        # Remove default classifier
        self.backbone.classifier = nn.Identity()

        # Custom head: attention pooling + dropout + classifier
        self.attn_pool = AttentionPooling(in_features)
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(p=dropout / 2),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        features = self.backbone(x)          # (B, in_features)
        features = self.attn_pool(features)  # (B, in_features) — channel re-weighting
        return self.classifier(features)     # (B, num_classes) — raw logits