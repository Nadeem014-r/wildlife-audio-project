import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from src.dataset import get_dataloaders, NUM_CLASSES
from src.model import BirdClassifier

def train_model(epochs=3, batch_size=32, fast_dev_run=False):
    # Setup Device
    # Use MPS on Apple Silicon, CUDA on Nvidia, CPU fallback
    if torch.backends.mps.is_available():
        device = torch.device('mps')
    elif torch.cuda.is_available():
        device = torch.device('cuda')
    else:
        device = torch.device('cpu')
    print(f"Using device: {device}")
    
    # 1. Load Data
    print("Loading datasets...")
    train_loader, val_loader, test_loader = get_dataloaders(
        "data/birdclef-2026/train.csv", 
        "data/birdclef-2026/train_audio",
        batch_size=batch_size
    )
    
    # 2. Setup Model, Loss, Optimizer
    print("Initializing Model...")
    model = BirdClassifier(num_classes=NUM_CLASSES).to(device)
    
    # Multi-label classification requires BCEWithLogitsLoss
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    # Setup directories
    os.makedirs("models", exist_ok=True)
    best_loss = float('inf')
    early_stop_patience = 5
    patience_counter = 0
    
    # 3. Training Loop
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        print(f"\n--- Epoch {epoch+1}/{epochs} ---")
        
        for i, (inputs, targets) in enumerate(train_loader):
            inputs, targets = inputs.to(device), targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            train_loss += loss.item() * inputs.size(0)
            
            if i % 10 == 0:
                print(f"Batch {i}/{len(train_loader)} - Train Loss: {loss.item():.4f}")
                
            # If fast_dev_run is true, break early
            if fast_dev_run and i == 2:
                print("[FAST DEV RUN] Breaking train loop early.")
                break
                
        # 4. Validation Loop
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for i, (inputs, targets) in enumerate(val_loader):
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                val_loss += loss.item() * inputs.size(0)
                
                if fast_dev_run and i == 2:
                    print("[FAST DEV RUN] Breaking val loop early.")
                    break
                    
        # Calculate Average Losses
        # Note: In fast_dev_run, these averages are slightly skewed, but it's just a test.
        dataset_train_len = (3 * batch_size) if fast_dev_run else len(train_loader.dataset)
        dataset_val_len = (3 * batch_size) if fast_dev_run else len(val_loader.dataset)
        
        avg_train_loss = train_loss / dataset_train_len
        avg_val_loss = val_loss / dataset_val_len
        

        
        print(f"Epoch {epoch+1} Summary:")
        print(f"  > Average Train Loss: {avg_train_loss:.4f}")
        print(f"  > Average Val Loss: {avg_val_loss:.4f}")
        
        # Save Best Model & Early Stopping
        if avg_val_loss < best_loss:
            best_loss = avg_val_loss
            model_path = "models/best_model.pth"
            torch.save(model.state_dict(), model_path)
            print(f"⭐️ Saved new best model to {model_path}!")
            patience_counter = 0
        else:
            patience_counter += 1
            print(f"  > Early stopping counter: {patience_counter}/{early_stop_patience}")
            if patience_counter >= early_stop_patience:
                print("🛑 Early stopping triggered. Validation loss hasn't improved.")
                break
                
        # Step the scheduler
        scheduler.step()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=15, help='Number of epochs to train')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--fast-dev-run', action='store_true', help='Run short 3-batch loops to test the pipeline')
    args = parser.parse_args()
    
    train_model(epochs=args.epochs, batch_size=args.batch_size, fast_dev_run=args.fast_dev_run)
