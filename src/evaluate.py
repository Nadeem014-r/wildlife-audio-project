import argparse
import torch
import numpy as np
from sklearn.metrics import f1_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

from src.dataset import get_dataloaders, NUM_CLASSES, TOP_SPECIES
from src.model import BirdClassifier

def evaluate_model(model_path="models/best_model.pth", fast_dev_run=False):
    device = torch.device('mps' if torch.backends.mps.is_available() else 'cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Evaluating on device: {device}")
    
    _, _, test_loader = get_dataloaders(
        "data/birdclef-2026/train.csv", 
        "data/birdclef-2026/train_audio",
        batch_size=16
    )
    
    model = BirdClassifier(num_classes=NUM_CLASSES)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    
    all_targets = []
    all_preds = []
    
    print("Running evaluation on test set...")
    with torch.no_grad():
        for i, (inputs, targets) in enumerate(test_loader):
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            
            # Apply sigmoid and threshold
            probs = torch.sigmoid(outputs)
            preds = (probs > 0.5).float()
            
            all_targets.append(targets.cpu().numpy())
            all_preds.append(preds.cpu().numpy())
            
            if fast_dev_run and i == 2:
                break
                
    all_targets = np.vstack(all_targets)
    all_preds = np.vstack(all_preds)
    
    # Calculate Metrics
    micro_f1 = f1_score(all_targets, all_preds, average='micro')
    macro_f1 = f1_score(all_targets, all_preds, average='macro', zero_division=0)
    
    print(f"\nMicro F1 Score: {micro_f1:.4f}")
    print(f"Macro F1 Score: {macro_f1:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(all_targets, all_preds, target_names=TOP_SPECIES, zero_division=0))
    
    # Optional: Plot correlation / confusion-style matrix for Multi-label
    # For multi-label, a strict confusion matrix is multi-dimensional.
    # Instead, we can plot the correlation between true labels and predictions.
    
    # Simple label-wise accuracy bar chart
    accuracies = []
    for i in range(NUM_CLASSES):
        acc = (all_targets[:, i] == all_preds[:, i]).mean()
        accuracies.append(acc)
        
    plt.figure(figsize=(12, 6))
    sns.barplot(x=TOP_SPECIES, y=accuracies)
    plt.title('Per-Class Accuracy on Test Set')
    plt.ylabel('Accuracy')
    plt.xticks(rotation=45)
    plt.tight_layout()
    output_path = "/Users/harshanand/.gemini/antigravity/brain/4a234e41-83ce-4150-a8e6-3ec97e3801d8/evaluation_results.png"
    plt.savefig(output_path)
    print(f"Saved evaluation bar chart to {output_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--fast-dev-run', action='store_true')
    args = parser.parse_args()
    
    evaluate_model(fast_dev_run=args.fast_dev_run)
