import matplotlib.pyplot as plt
import numpy as np
from src.dataset import get_dataloaders, ID_TO_LABEL

def test_pipeline():
    train_csv_path = "data/birdclef-2026/train.csv"
    audio_dir = "data/birdclef-2026/train_audio"
    
    print("Initializing DataLoaders...")
    train_loader, val_loader, test_loader = get_dataloaders(train_csv_path, audio_dir, batch_size=4)
    
    print("\nFetching one batch from Train Loader...")
    # Get a single batch
    data_iter = iter(train_loader)
    specs, targets = next(data_iter)
    
    print(f"Spectrogram Batch Shape: {specs.shape}")
    print(f"Targets Batch Shape: {targets.shape}")
    
    # Analyze the first item in the batch
    spec = specs[0].numpy()
    target = targets[0].numpy()
    
    # Find which labels are active (since it's multi-label due to mixing)
    active_labels = [ID_TO_LABEL[i] for i, val in enumerate(target) if val == 1.0]
    print(f"First sample active labels: {active_labels}")
    
    # Save a picture of the first spectrogram
    plt.figure(figsize=(10, 4))
    plt.imshow(spec[0], aspect='auto', origin='lower')
    plt.colorbar(format='%+2.0f dB')
    plt.title(f"Augmented Spectrogram - {', '.join(active_labels)}")
    plt.tight_layout()
    output_path = "/Users/harshanand/.gemini/antigravity/brain/4a234e41-83ce-4150-a8e6-3ec97e3801d8/augmented_spectrogram.png"
    plt.savefig(output_path)
    plt.close()
    
    print(f"Saved test spectrogram to {output_path}")
    print("Pipeline Test Successful! ✅")

if __name__ == '__main__':
    test_pipeline()
