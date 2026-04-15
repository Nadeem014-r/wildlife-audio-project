import argparse
import os

import torch 
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    f1_score, classification_report, roc_auc_score,
    average_precision_score, precision_recall_curve
)

from src.dataset import get_dataloaders, NUM_CLASSES, TOP_SPECIES
from src.model import BirdClassifier


# ─── Threshold Search ────────────────────────────────────────────────────────

def find_optimal_threshold(targets, probs, thresholds=None):
    """
    Search over candidate thresholds and return the one that maximises
    macro-averaged F1 on the provided targets/probs.
    """
    if thresholds is None:
        thresholds = np.arange(0.1, 0.9, 0.05)

    best_thresh, best_f1 = 0.5, -1.0
    for t in thresholds:
        preds = (probs >= t).astype(float)
        f1 = f1_score(targets, preds, average='macro', zero_division=0)
        if f1 > best_f1:
            best_f1, best_thresh = f1, t

    print(f"Optimal threshold: {best_thresh:.2f}  (macro-F1 = {best_f1:.4f})")
    return best_thresh


# ─── Plotting helpers ─────────────────────────────────────────────────────────

def plot_per_class_metrics(targets, preds, probs, output_dir):
    """Bar chart: per-class F1, precision, recall + AUC-ROC."""
    os.makedirs(output_dir, exist_ok=True)

    f1s, precs, recs, aucs, aps = [], [], [], [], []
    for i in range(NUM_CLASSES):
        p = preds[:, i]
        t = targets[:, i]
        pb = probs[:, i]
        f1s.append(f1_score(t, p, zero_division=0))
        precs.append((p * t).sum() / max(p.sum(), 1))
        recs.append((p * t).sum() / max(t.sum(), 1))
        aucs.append(roc_auc_score(t, pb) if t.sum() > 0 else 0.0)
        aps.append(average_precision_score(t, pb) if t.sum() > 0 else 0.0)

    x = np.arange(NUM_CLASSES)
    width = 0.2

    fig, axes = plt.subplots(2, 1, figsize=(16, 12))

    # Subplot 1: F1 / Precision / Recall
    ax = axes[0]
    ax.bar(x - width, f1s,   width, label='F1',        color='steelblue',   alpha=0.85)
    ax.bar(x,         precs,  width, label='Precision', color='darkorange', alpha=0.85)
    ax.bar(x + width, recs,   width, label='Recall',    color='seagreen',   alpha=0.85)
    ax.set_xticks(x)
    ax.set_xticklabels(TOP_SPECIES, rotation=45, ha='right')
    ax.set_ylim(0, 1.05)
    ax.set_ylabel('Score')
    ax.set_title('Per-class F1 / Precision / Recall')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)

    # Subplot 2: AUC-ROC & Average Precision
    ax2 = axes[1]
    ax2.bar(x - width / 2, aucs, width, label='AUC-ROC', color='mediumpurple', alpha=0.85)
    ax2.bar(x + width / 2, aps,  width, label='Avg Prec', color='tomato',       alpha=0.85)
    ax2.set_xticks(x)
    ax2.set_xticklabels(TOP_SPECIES, rotation=45, ha='right')
    ax2.axhline(0.5, color='gray', linestyle='--', linewidth=0.8, label='Random baseline')
    ax2.set_ylim(0, 1.05)
    ax2.set_ylabel('Score')
    ax2.set_title('Per-class AUC-ROC & Average Precision')
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)

    plt.tight_layout()
    path = os.path.join(output_dir, 'per_class_metrics.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"Saved: {path}")


def plot_confusion_heatmap(targets, preds, output_dir):
    """
    Multi-label 'confusion' heatmap: rows = true label, cols = predicted label,
    cell = fraction of true-label samples where col was also predicted.
    """
    os.makedirs(output_dir, exist_ok=True)

    mat = np.zeros((NUM_CLASSES, NUM_CLASSES))
    for i in range(NUM_CLASSES):
        mask = targets[:, i] == 1
        if mask.sum() > 0:
            mat[i] = preds[mask].mean(axis=0)

    fig, ax = plt.subplots(figsize=(14, 12))
    sns.heatmap(
        mat, annot=True, fmt='.2f',
        xticklabels=TOP_SPECIES, yticklabels=TOP_SPECIES,
        cmap='Blues', vmin=0, vmax=1, ax=ax
    )
    ax.set_xlabel('Predicted label')
    ax.set_ylabel('True label')
    ax.set_title('Multi-label co-prediction heatmap\n(row = true species, cell = P(col predicted | row is true))')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()

    path = os.path.join(output_dir, 'confusion_heatmap.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"Saved: {path}")


def plot_precision_recall_curves(targets, probs, output_dir):
    """Precision-recall curve for each class."""
    os.makedirs(output_dir, exist_ok=True)

    fig, axes = plt.subplots(3, 5, figsize=(20, 12))
    axes = axes.flatten()

    for i, (species, ax) in enumerate(zip(TOP_SPECIES, axes)):
        if targets[:, i].sum() == 0:
            ax.set_title(f'{species}\n(no positives)')
            continue
        prec, rec, _ = precision_recall_curve(targets[:, i], probs[:, i])
        ap = average_precision_score(targets[:, i], probs[:, i])
        ax.plot(rec, prec, lw=1.5, color='steelblue')
        ax.fill_between(rec, prec, alpha=0.1, color='steelblue')
        ax.set_title(f'{species}\nAP={ap:.2f}', fontsize=9)
        ax.set_xlabel('Recall', fontsize=7)
        ax.set_ylabel('Precision', fontsize=7)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1.05)
        ax.grid(alpha=0.3)

    plt.suptitle('Precision-Recall Curves (per class)', fontsize=13, y=1.01)
    plt.tight_layout()
    path = os.path.join(output_dir, 'pr_curves.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")


# ─── Main Evaluation ──────────────────────────────────────────────────────────

def evaluate_model(
    model_path="models/best_model.pth",
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
        "data/birdclef-2026/train.csv",
        "data/birdclef-2026/train_audio",
        batch_size=16
    )

    model = BirdClassifier(num_classes=NUM_CLASSES)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print(f"Loaded weights: {model_path}")
    else:
        print(f"WARNING: {model_path} not found — using untrained weights.")
    model.to(device)
    model.eval()

    all_targets = []
    all_probs   = []

    print("Running inference on test set...")
    with torch.no_grad():
        for i, (inputs, targets) in enumerate(test_loader):
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()
            all_targets.append(targets.numpy())
            all_probs.append(probs)
            if fast_dev_run and i == 4:
                break

    all_targets = np.vstack(all_targets)  # (N, C)
    all_probs   = np.vstack(all_probs)    # (N, C)

    # ── Threshold selection ──────────────────────────────────────────────────
    best_thresh = find_optimal_threshold(all_targets, all_probs)
    all_preds   = (all_probs >= best_thresh).astype(float)

    # ── Summary metrics ──────────────────────────────────────────────────────
    micro_f1 = f1_score(all_targets, all_preds, average='micro',   zero_division=0)
    macro_f1 = f1_score(all_targets, all_preds, average='macro',   zero_division=0)
    wt_f1    = f1_score(all_targets, all_preds, average='weighted', zero_division=0)

    # Mean AUC-ROC (skip classes with no positives)
    aucs = []
    for i in range(NUM_CLASSES):
        if all_targets[:, i].sum() > 0:
            aucs.append(roc_auc_score(all_targets[:, i], all_probs[:, i]))
    mean_auc = float(np.mean(aucs)) if aucs else 0.0

    mean_ap = average_precision_score(all_targets, all_probs, average='macro')

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"  Threshold (optimal):  {best_thresh:.2f}")
    print(f"  Micro F1:             {micro_f1:.4f}")
    print(f"  Macro F1:             {macro_f1:.4f}")
    print(f"  Weighted F1:          {wt_f1:.4f}")
    print(f"  Mean AUC-ROC:         {mean_auc:.4f}")
    print(f"  Mean Avg Precision:   {mean_ap:.4f}")
    print("=" * 60)

    print("\nPer-class classification report (threshold={:.2f}):".format(best_thresh))
    print(classification_report(
        all_targets, all_preds,
        target_names=TOP_SPECIES, zero_division=0
    ))

    # ── Plots ────────────────────────────────────────────────────────────────
    plot_per_class_metrics(all_targets, all_preds, all_probs, output_dir)
    plot_confusion_heatmap(all_targets, all_preds, output_dir)
    plot_precision_recall_curves(all_targets, all_probs, output_dir)

    print(f"\nAll plots saved to: {output_dir}/")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-path',    default='models/best_model.pth')
    parser.add_argument('--output-dir',    default='evaluation_results')
    parser.add_argument('--fast-dev-run',  action='store_true')
    args = parser.parse_args()

    evaluate_model(
        model_path=args.model_path,
        output_dir=args.output_dir,
        fast_dev_run=args.fast_dev_run,
    )