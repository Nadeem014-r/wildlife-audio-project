import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import argparse
import math
import torch
import torch.nn as nn
import torch.optim as optim

from src.dataset import get_dataloaders, NUM_CLASSES
from src.model import BirdClassifier


def cosine_schedule_with_warmup(optimizer, warmup_steps, total_steps, min_lr_ratio=0.1):
    """Linear warmup then cosine annealing."""
    def lr_lambda(step):
        if step < warmup_steps:
            return float(step) / float(max(1, warmup_steps))
        progress = float(step - warmup_steps) / float(max(1, total_steps - warmup_steps))
        return min_lr_ratio + (1 - min_lr_ratio) * 0.5 * (1 + math.cos(math.pi * progress))
    return optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)


def train_model(epochs=30, batch_size=32, fast_dev_run=False):
    # Device selection
    if torch.backends.mps.is_available():
        device = torch.device('mps')
    elif torch.cuda.is_available():
        device = torch.device('cuda')
    else:
        device = torch.device('cpu')

    print(f"Using device: {device}")

    # Data — correct path
    print("Loading datasets...")
    train_loader, val_loader, _ = get_dataloaders(
        "data/combined_birds/train.csv",
        "data/combined_birds/audio",
        batch_size=batch_size
    )

    # Model
    print(f"Initializing model (EfficientNet-B2 | {NUM_CLASSES} classes)...")
    model = BirdClassifier(num_classes=NUM_CLASSES, dropout=0.35).to(device)

    # Freeze backbone for first 5 epochs (Phase 1)
    for param in model.backbone.parameters():
        param.requires_grad = False

    # Loss: CrossEntropyLoss for single-label classification
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=3e-4, weight_decay=1e-4
    )

    total_steps = epochs * len(train_loader)
    warmup_steps = max(1, total_steps // 10)
    scheduler = cosine_schedule_with_warmup(optimizer, warmup_steps, total_steps)

    os.makedirs("models", exist_ok=True)
    best_val_loss = float('inf')
    patience_counter = 0
    early_stop_patience = 10

    for epoch in range(epochs):
        # Phase 2: Unfreeze backbone after epoch 5
        if epoch == 5:
            print("\n  [Phase 2] Unfreezing backbone for fine-tuning...")
            for param in model.backbone.parameters():
                param.requires_grad = True
            optimizer = optim.AdamW(model.parameters(), lr=3e-5, weight_decay=1e-4)
            remaining_steps = (epochs - 5) * len(train_loader)
            new_warmup = max(1, remaining_steps // 10)
            scheduler = cosine_schedule_with_warmup(optimizer, new_warmup, remaining_steps)

        # Training
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        print(f"\n── Epoch {epoch + 1}/{epochs} ──")

        for i, (inputs, targets) in enumerate(train_loader):
            inputs, targets = inputs.to(device), targets.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            running_loss += loss.item() * inputs.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == targets).sum().item()
            total += inputs.size(0)

            if i % 50 == 0:
                lr = optimizer.param_groups[0]['lr']
                acc = correct / total * 100
                print(f"  Batch {i:4d}/{len(train_loader)} | loss: {loss.item():.4f} | acc: {acc:.1f}% | lr: {lr:.2e}")

            if fast_dev_run and i == 4:
                print("[FAST DEV RUN] Stopping train loop early.")
                break

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for i, (inputs, targets) in enumerate(val_loader):
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                val_loss += loss.item() * inputs.size(0)
                preds = outputs.argmax(dim=1)
                val_correct += (preds == targets).sum().item()
                val_total += inputs.size(0)
                if fast_dev_run and i == 4:
                    break

        n_train = total if fast_dev_run else len(train_loader.dataset)
        n_val   = val_total if fast_dev_run else len(val_loader.dataset)
        avg_train = running_loss / n_train
        avg_val   = val_loss / n_val
        train_acc = correct / total * 100
        val_acc   = val_correct / val_total * 100

        print(f"  Train loss: {avg_train:.4f} | Train acc: {train_acc:.1f}%")
        print(f"  Val   loss: {avg_val:.4f} | Val   acc: {val_acc:.1f}%")

        if avg_val < best_val_loss:
            best_val_loss = avg_val
            torch.save(model.state_dict(), "models/best_model.pth")
            print(f"  ★ Saved new best model! (val_acc={val_acc:.1f}%)")
            patience_counter = 0
        else:
            patience_counter += 1
            print(f"  No improvement ({patience_counter}/{early_stop_patience})")
            if patience_counter >= early_stop_patience:
                print("Early stopping triggered.")
                break

    print(f"\nTraining complete. Best val loss: {best_val_loss:.4f}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs',       type=int,  default=30)
    parser.add_argument('--batch-size',   type=int,  default=32)
    parser.add_argument('--fast-dev-run', action='store_true')
    args = parser.parse_args()

    train_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
        fast_dev_run=args.fast_dev_run,
    )
