import argparse
import os
import torch
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import f1_score, classification_report, confusion_matrix

from src.dataset import get_dataloaders, NUM_CLASSES, TOP_SPECIES
from src.model import BirdClassifier

def evaluate_model(model_path="models/best_model.pth", output_dir="evaluation_results", fast_dev_run=False):
    device = torch.device('mps' if torch.backends.mps.is_available() else 'cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Evaluating on device: {device}")
    
    # Use the correct paths for your merged dataset
    _, _, test_loader = get_dataloaders(
        "data/combined_birds/train.csv", 
        "data/combined_birds/audio",
        batch_size=32
    )
    
    model = BirdClassifier(num_classes=NUM_CLASSES)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
        print(f"Loaded best model from {model_path}")
    else:
        print(f"ERROR: {model_path} not found.")
        return

    model.to(device)
    model.eval()
    
    all_targets = []
    all_preds = []
    all_probs = []
    
    print("Running evaluation on test set...")
    with torch.no_grad():
        for i, (inputs, targets) in enumerate(test_loader):
            inputs = inputs.to(device)
            outputs = model(inputs)
            
            # For single-label classification
            probs = torch.softmax(outputs, dim=1)
            preds = torch.argmax(probs, dim=1)
            
            all_targets.append(targets.cpu().numpy())
            all_preds.append(preds.cpu().numpy())
            all_probs.append(probs.cpu().numpy())
            
            if fast_dev_run and i == 4:
                break
                
    # Flatten lists into single numpy arrays
    y_true = np.concatenate(all_targets)
    y_pred = np.concatenate(all_preds)
    y_probs = np.concatenate(all_probs)
    
    # Calculate Overall Metrics
    top1_acc = (y_true == y_pred).mean()
    macro_f1 = f1_score(y_true, y_pred, average='macro', zero_division=0)
    
    # Calculate Top-5 Accuracy
    top5_correct = 0
    for i in range(len(y_true)):
        top5_indices = np.argsort(y_probs[i])[-5:]
        if y_true[i] in top5_indices:
            top5_correct += 1
    top5_acc = top5_correct / len(y_true)

    print("\n" + "="*40)
    print("FINAL EVALUATION RESULTS")
    print("="*40)
    print(f"Top-1 Accuracy: {top1_acc*100:.2f}%")
    print(f"Top-5 Accuracy: {top5_acc*100:.2f}%")
    print(f"Macro F1 Score: {macro_f1:.4f}")
    print("="*40)
    
    # Per-class report
    print("\nGenerating Detailed Report...")
    report = classification_report(y_true, y_pred, target_names=TOP_SPECIES, zero_division=0)
    
    # Save results to file
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "metrics.txt"), "w") as f:
        f.write(f"Top-1 Accuracy: {top1_acc*100:.2f}%\n")
        f.write(f"Top-5 Accuracy: {top5_acc*100:.2f}%\n")
        f.write(f"Macro F1 Score: {macro_f1:.4f}\n\n")
        f.write(report)

    # Plot Confusion Matrix (Top 30 most frequent classes for readability)
    unique, counts = np.unique(y_true, return_counts=True)
    top_30_indices = unique[np.argsort(counts)[-30:]]
    
    mask = np.isin(y_true, top_30_indices) & np.isin(y_pred, top_30_indices)
    cm = confusion_matrix(y_true[mask], y_pred[mask], labels=top_30_indices)
    
    plt.figure(figsize=(15, 12))
    sns.heatmap(cm, annot=False, fmt='d', cmap='Blues',
                xticklabels=[TOP_SPECIES[i] for i in top_30_indices],
                yticklabels=[TOP_SPECIES[i] for i in top_30_indices])
    plt.title('Confusion Matrix (Top 30 Frequent Classes)')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "confusion_matrix.png"))
    print(f"Results saved to the '{output_dir}/' folder.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-path', default='models/best_model.pth')
    parser.add_argument('--fast-dev-run', action='store_true')
    args = parser.parse_args()
    
    evaluate_model(model_path=args.model_path, fast_dev_run=args.fast_dev_run)
