import argparse
import os

import torch
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    f1_score, classification_report, confusion_matrix
)

from src.dataset import get_dataloaders, NUM_CLASSES, TOP_SPECIES
from src.model import BirdClassifier


# ─── Plotting helpers ─────────────────────────────────────────────────────────

def plot_top_class_accuracy(per_class_correct, per_class_total, output_dir):
    """Bar chart: per-class top-1 accuracy."""
    os.makedirs(output_dir, exist_ok=True)

    accs = []
    for i in range(NUM_CLASSES):
        total = per_class_total[i]
        accs.append(per_class_correct[i] / total if total > 0 else 0.0)

    x = np.arange(NUM_CLASSES)
    fig, ax = plt.subplots(figsize=(max(16, NUM_CLASSES // 4), 6))
    bars = ax.bar(x, accs, color='steelblue', alpha=0.85)
    ax.set_xticks(x)
    ax.set_xticklabels(TOP_SPECIES, rotation=90, ha='center', fontsize=7)
    ax.set_ylim(0, 1.05)
    ax.set_ylabel('Top-1 Accuracy')
    ax.set_title('Per-class Top-1 Accuracy')
    ax.axhline(1.0 / NUM_CLASSES, color='red', linestyle='--',
               linewidth=0.8, label=f'Random baseline (1/{NUM_CLASSES}={1/NUM_CLASSES:.3f})')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    plt.tight_layout()

    path = os.path.join(output_dir, 'per_class_accuracy.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"Saved: {path}")


def plot_confusion_heatmap(true_labels, pred_labels, output_dir, max_classes=50):
    """
    Confusion matrix heatmap. If NUM_CLASSES > max_classes, only shows the
    top-max_classes most frequent classes for readability.
    """
    os.makedirs(output_dir, exist_ok=True)

    if NUM_CLASSES > max_classes:
        # Find the most common true classes
        counts = np.bincount(true_labels, minlength=NUM_CLASSES)
        top_indices = np.argsort(counts)[::-1][:max_classes]
        mask = np.isin(true_labels, top_indices)
        t = true_labels[mask]
        p = pred_labels[mask]
        # Re-map to 0..max_classes-1
        idx_map = {old: new for new, old in enumerate(top_indices)}
        t = np.array([idx_map[v] for v in t])
        p = np.array([idx_map.get(v, -1) for v in p])
        valid = p >= 0
        t, p = t[valid], p[valid]
        labels = [TOP_SPECIES[i] for i in top_indices]
        title = f'Confusion Matrix (top-{max_classes} classes by frequency)'
    else:
        t, p = true_labels, pred_labels
        labels = TOP_SPECIES
        title = 'Confusion Matrix'

    cm = confusion_matrix(t, p, labels=list(range(len(labels))))
    # Normalize by row
    cm_norm = cm.astype(float) / (cm.sum(axis=1, keepdims=True) + 1e-9)

    fig, ax = plt.subplots(figsize=(14, 12))
    sns.heatmap(
        cm_norm, annot=False,
        xticklabels=labels, yticklabels=labels,
        cmap='Blues', vmin=0, vmax=1, ax=ax
    )
    ax.set_xlabel('Predicted')
    ax.set_ylabel('True')
    ax.set_title(title)
    plt.xticks(rotation=45, ha='right', fontsize=7)
    plt.yticks(rotation=0, fontsize=7)
    plt.tight_layout()

    path = os.path.join(output_dir, 'confusion_heatmap.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"Saved: {path}")


def plot_confidence_histogram(top1_probs, correct_mask, output_dir):
    """Histogram of top-1 confidence, split by correct vs wrong."""
    os.makedirs(output_dir, exist_ok=True)

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(top1_probs[correct_mask], bins=40, alpha=0.7,
            color='steelblue', label='Correct prediction')
    ax.hist(top1_probs[~correct_mask], bins=40, alpha=0.7,
            color='tomato', label='Wrong prediction')
    ax.set_xlabel('Top-1 Confidence (softmax probability)')
    ax.set_ylabel('Count')
    ax.set_title('Confidence Distribution — Correct vs Wrong')
    ax.axvline(1.0 / NUM_CLASSES, color='gray', linestyle='--',
               linewidth=0.8, label=f'Random baseline ({1/NUM_CLASSES:.3f})')
    ax.legend()
    ax.grid(alpha=0.3)
    plt.tight_layout()

    path = os.path.join(output_dir, 'confidence_histogram.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"Saved: {path}")


# ─── Main Evaluation ──────────────────────────────────────────────────────────

def evaluate_model(
    model_path="models/best_model.pth",
    train_csv="data/combined_birds/train.csv",
    audio_dir="data/combined_birds/audio",
    output_dir="evaluation_results",
    fast_dev_run=False
):
    if torch.backends.mps.is_available():
        device = torch.device('mps')
    elif torch.cuda.is_available():
        device = torch.device('cuda')
    else:
        device = torch.device('cpu')

    print(f"Evaluating on: {device}")

    _, _, test_loader = get_dataloaders(
        train_csv,
        audio_dir,
        batch_size=32
    )

    model = BirdClassifier(num_classes=NUM_CLASSES)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
        print(f"Loaded weights: {model_path}")
    else:
        print(f"WARNING: {model_path} not found — using untrained weights.")
    model.to(device)
    model.eval()

    all_true   = []   # integer class indices
    all_pred   = []   # integer predicted class indices
    all_top5   = []   # (N, 5) top-5 predicted indices
    all_top1_conf = []  # top-1 softmax confidence

    print("Running inference on test set...")
    with torch.no_grad():
        for i, (inputs, targets) in enumerate(test_loader):
            inputs = inputs.to(device)
            outputs = model(inputs)                          # (B, C) logits
            probs = torch.softmax(outputs, dim=1).cpu()     # (B, C)

            top1_conf, top1_pred = probs.max(dim=1)
            top5_pred = probs.topk(5, dim=1).indices        # (B, 5)

            all_true.extend(targets.numpy().tolist())
            all_pred.extend(top1_pred.numpy().tolist())
            all_top5.extend(top5_pred.numpy().tolist())
            all_top1_conf.extend(top1_conf.numpy().tolist())

            if fast_dev_run and i == 4:
                break

    all_true      = np.array(all_true)
    all_pred      = np.array(all_pred)
    all_top5      = np.array(all_top5)      # (N, 5)
    all_top1_conf = np.array(all_top1_conf) # (N,)

    N = len(all_true)

    # ── Accuracy metrics ──────────────────────────────────────────────────────
    top1_correct = (all_pred == all_true)
    top5_correct = np.array([all_true[i] in all_top5[i] for i in range(N)])

    top1_acc = top1_correct.mean()
    top5_acc = top5_correct.mean()

    # Per-class top-1 counts
    per_class_correct = np.zeros(NUM_CLASSES)
    per_class_total   = np.zeros(NUM_CLASSES)
    for t, correct in zip(all_true, top1_correct):
        per_class_total[t]   += 1
        per_class_correct[t] += int(correct)

    # F1 (macro) using argmax predictions
    macro_f1 = f1_score(all_true, all_pred, average='macro', zero_division=0)
    weighted_f1 = f1_score(all_true, all_pred, average='weighted', zero_division=0)

    mean_per_class_acc = np.mean([
        per_class_correct[i] / per_class_total[i]
        for i in range(NUM_CLASSES) if per_class_total[i] > 0
    ])

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY  (Single-Label Classification)")
    print("=" * 60)
    print(f"  Total test samples:        {N}")
    print(f"  Top-1 Accuracy:            {top1_acc:.4f}  ({top1_acc*100:.1f}%)")
    print(f"  Top-5 Accuracy:            {top5_acc:.4f}  ({top5_acc*100:.1f}%)")
    print(f"  Mean Per-Class Accuracy:   {mean_per_class_acc:.4f}  ({mean_per_class_acc*100:.1f}%)")
    print(f"  Macro F1:                  {macro_f1:.4f}")
    print(f"  Weighted F1:               {weighted_f1:.4f}")
    print(f"  Random-chance baseline:    {1/NUM_CLASSES:.4f}  ({100/NUM_CLASSES:.2f}%)")
    print("=" * 60)
    print()

    # Per-class report (sklearn)
    print("Per-class classification report (top-1 argmax):")
    print(classification_report(
        all_true, all_pred,
        target_names=TOP_SPECIES, zero_division=0
    ))

    # ── Plots ─────────────────────────────────────────────────────────────────
    os.makedirs(output_dir, exist_ok=True)
    plot_top_class_accuracy(per_class_correct, per_class_total, output_dir)
    plot_confusion_heatmap(all_true, all_pred, output_dir)
    plot_confidence_histogram(all_top1_conf, top1_correct, output_dir)

    print(f"\nAll plots saved to: {output_dir}/")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-path', default='models/best_model.pth')
    parser.add_argument('--train-csv',  default='data/combined_birds/train.csv')
    parser.add_argument('--audio-dir',  default='data/combined_birds/audio')
    parser.add_argument('--output-dir', default='evaluation_results')
    parser.add_argument('--fast-dev-run', action='store_true')
    args = parser.parse_args()

    evaluate_model(
        model_path=args.model_path,
        train_csv=args.train_csv,
        audio_dir=args.audio_dir,
        output_dir=args.output_dir,
        fast_dev_run=args.fast_dev_run,
    )