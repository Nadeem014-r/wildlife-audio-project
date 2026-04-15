import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import argparse
import math
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast

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


def train_model(epochs=20, batch_size=32, fast_dev_run=False, grad_accum_steps=2):
    # Device selection
    if torch.backends.mps.is_available():
        device = torch.device('mps')
        use_amp = False          # AMP not stable on MPS
    elif torch.cuda.is_available():
        device = torch.device('cuda')
        use_amp = True
    else:
        device = torch.device('cpu')
        use_amp = False

    print(f"Using device: {device}  |  AMP: {use_amp}  |  Grad accum: {grad_accum_steps}x")

    # Data
    print("Loading datasets...")
    train_loader, val_loader, _ = get_dataloaders(
        "data/combined_birds/train.csv",
        "data/combined_birds/audio",
        batch_size=batch_size
    )

    # Model
    print("Initializing model (EfficientNet-B2)...")
    model = BirdClassifier(num_classes=NUM_CLASSES, dropout=0.35).to(device)

    # TWO-PHASE TRAINING: Freeze the backbone initially (Phase 1)
    for param in model.backbone.parameters():
        param.requires_grad = False

    # Loss + optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4, betas=(0.9, 0.999))

    total_steps = epochs * len(train_loader) // grad_accum_steps
    warmup_steps = max(1, total_steps // 10)
    scheduler = cosine_schedule_with_warmup(optimizer, warmup_steps, total_steps)
    scaler = GradScaler(enabled=use_amp)

    os.makedirs("models", exist_ok=True)
    best_val_loss = float('inf')
    patience_counter = 0
    early_stop_patience = 10

    for epoch in range(epochs):
        # ── Phase 2: Unfreeze Backbone ────────────────────────────────────────
        if epoch == 5:
            print("  [Phase 2] Unfreezing backbone for fine-tuning...")
            for param in model.backbone.parameters():
                param.requires_grad = True
            
            # Re-initialize optimizer & scheduler for Phase 2 (lower learning rate)
            optimizer = optim.AdamW(model.parameters(), lr=3e-5, weight_decay=1e-4, betas=(0.9, 0.999))
            remaining_steps = (epochs - 5) * len(train_loader) // grad_accum_steps
            new_warmup = max(1, remaining_steps // 10)
            scheduler = cosine_schedule_with_warmup(optimizer, new_warmup, remaining_steps)

        # ── Training ──────────────────────────────────────────────────────────
        model.train()
        running_loss = 0.0
        optimizer.zero_grad()
        print(f"\n── Epoch {epoch + 1}/{epochs} ──")

        for i, (inputs, targets) in enumerate(train_loader):
            inputs, targets = inputs.to(device), targets.to(device)

            with autocast(enabled=use_amp):
                outputs = model(inputs)
                loss = criterion(outputs, targets) / grad_accum_steps

            scaler.scale(loss).backward()
            running_loss += loss.item() * grad_accum_steps * inputs.size(0)

            # Gradient accumulation step
            if (i + 1) % grad_accum_steps == 0 or (i + 1) == len(train_loader):
                scaler.unscale_(optimizer)
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                scaler.step(optimizer)
                scaler.update()
                optimizer.zero_grad()
                scheduler.step()

            if i % 20 == 0:
                lr = optimizer.param_groups[0]['lr']
                print(f"  Batch {i:4d}/{len(train_loader)} | loss: {loss.item() * grad_accum_steps:.4f} | lr: {lr:.2e}")

            if fast_dev_run and i == 2:
                print("[FAST DEV RUN] Stopping train loop early.")
                break

        # ── Validation ────────────────────────────────────────────────────────
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for i, (inputs, targets) in enumerate(val_loader):
                inputs, targets = inputs.to(device), targets.to(device)
                with autocast(enabled=use_amp):
                    outputs = model(inputs)
                    loss = criterion(outputs, targets)
                val_loss += loss.item() * inputs.size(0)
                if fast_dev_run and i == 2:
                    break

        n_train = min(3 * batch_size, len(train_loader.dataset)) if fast_dev_run else len(train_loader.dataset)
        n_val   = min(3 * batch_size, len(val_loader.dataset))   if fast_dev_run else len(val_loader.dataset)
        avg_train = running_loss / n_train
        avg_val   = val_loss / n_val

        print(f"  Train loss: {avg_train:.4f}  |  Val loss: {avg_val:.4f}")

        if avg_val < best_val_loss:
            best_val_loss = avg_val
            torch.save(model.state_dict(), "models/best_model.pth")
            print("  ★ Saved new best model!")
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
    parser.add_argument('--epochs',           type=int,  default=20)
    parser.add_argument('--batch-size',       type=int,  default=32)
    parser.add_argument('--grad-accum-steps', type=int,  default=2,
                        help='Gradient accumulation steps (effective batch = batch_size × steps)')
    parser.add_argument('--fast-dev-run',     action='store_true')
    args = parser.parse_args()

    train_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
        fast_dev_run=args.fast_dev_run,
        grad_accum_steps=args.grad_accum_steps,
    )