import os
import torch
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import librosa
from sklearn.model_selection import train_test_split
import random

# Top 15 selected classes
TOP_SPECIES = [
    'rubthr1', 'banana', 'soulap1', 'fepowl', 'houspa', 
    'osprey', 'coffal1', 'socfly1', 'yeofly1', 'compau', 
    'bobfly1', 'bncfly', 'whtdov', 'trsowl', 'bbwduc'
]
NUM_CLASSES = len(TOP_SPECIES)
LABEL_TO_ID = {label: idx for idx, label in enumerate(TOP_SPECIES)}
ID_TO_LABEL = {idx: label for label, idx in LABEL_TO_ID.items()}

def pad_or_truncate_audio(y, sr, max_length=5.0):
    target_len = int(sr * max_length)
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)))
    else:
        y = y[:target_len]
    return y, target_len

def audio_to_mel_spectrogram(y, sr=32000, n_mels=224, target_len=None):
    """ Converts a raw audio signal to a normalized Mel spectrogram of shape (1, 224, 224) """
    if target_len is None:
        target_len = len(y)
    
    hop_length = int(target_len / n_mels)
    # Generate Mel spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=n_mels, hop_length=hop_length, fmax=8000)
    S_dB = librosa.power_to_db(S, ref=np.max)
    
    # Normalize between 0 and 1
    S_dB = (S_dB - S_dB.min()) / (S_dB.max() - S_dB.min() + 1e-6)
    
    # Crop if slightly over 224 time steps due to rounding
    S_dB = S_dB[:, :n_mels]
    
    # Shape: (Channels, Height, Width) -> (3, 224, 224)
    S_dB = np.expand_dims(S_dB, axis=0)
    S_dB = np.repeat(S_dB, 3, axis=0)
    return S_dB

def spec_augment(spec, max_time_mask=25, max_freq_mask=25):
    """ Apply SpecAugment (Time and Frequency masking) to a spectrogram. """
    spec_aug = spec.copy()
    freq_bins = spec_aug.shape[1]
    time_steps = spec_aug.shape[2]
    
    # Frequency Masking
    num_freq_masks = random.randint(1, 2)
    for _ in range(num_freq_masks):
        f_mask = random.randint(0, max_freq_mask)
        f0 = random.randint(0, max(1, freq_bins - f_mask))
        spec_aug[0, f0:f0 + f_mask, :] = 0

    # Time Masking
    num_time_masks = random.randint(1, 2)
    for _ in range(num_time_masks):
        t_mask = random.randint(0, max_time_mask)
        t0 = random.randint(0, max(1, time_steps - t_mask))
        spec_aug[0, :, t0:t0 + t_mask] = 0
        
    return spec_aug

def mix_audio(y1, y2, snr=0.4):
    """Mix two raw audio arrays."""
    max_len = max(len(y1), len(y2))
    y1_pad = np.pad(y1, (0, max_len - len(y1)))
    y2_pad = np.pad(y2, (0, max_len - len(y2)))
    
    mixed = y1_pad * (1.0 - snr) + y2_pad * snr
    return mixed

class BirdDataset(Dataset):
    def __init__(self, metadata_df, audio_dir, sr=32000, max_length=5.0, augment=False):
        self.metadata = metadata_df.reset_index(drop=True)
        self.audio_dir = audio_dir
        self.sr = sr
        self.max_length = max_length
        self.augment = augment
        
    def __len__(self):
        return len(self.metadata)
        
    def __getitem__(self, idx):
        row = self.metadata.iloc[idx]
        file_path = os.path.join(self.audio_dir, row['filename'])
        
        # Create Target Tensor
        target = torch.zeros(NUM_CLASSES, dtype=torch.float32)
        if row['primary_label'] in LABEL_TO_ID:
            target[LABEL_TO_ID[row['primary_label']]] = 1.0
            
        try:
            import soundfile as sf
            # Only read the first few seconds (160000 frames)
            frames_to_read = int(self.sr * self.max_length)
            y, sr = sf.read(file_path, frames=frames_to_read, always_2d=True)
            y = y.mean(axis=1) # stereo to mono
            if sr != self.sr:
                y = librosa.resample(y, orig_sr=sr, target_sr=self.sr)
        except Exception:
            y = np.zeros(int(self.sr * self.max_length), dtype=np.float32)

        # Audio Mixing Data Augmentation
        if self.augment and random.random() < 0.4:
            mix_idx = random.randint(0, len(self.metadata) - 1)
            mix_row = self.metadata.iloc[mix_idx]
            mix_path = os.path.join(self.audio_dir, mix_row['filename'])
            try:
                import soundfile as sf
                y2, sr2 = sf.read(mix_path, frames=frames_to_read, always_2d=True)
                y2 = y2.mean(axis=1)
                if sr2 != self.sr:
                    y2 = librosa.resample(y2, orig_sr=sr2, target_sr=self.sr)
                
                random_snr = random.uniform(0.1, 0.5) # Dynamic mixing ratio
                y = mix_audio(y, y2, snr=random_snr)
                if mix_row['primary_label'] in LABEL_TO_ID:
                    # Soft labeling: distribute probability based on SNR
                    orig_target_val = target.max() # 1.0 or 0.0
                    target *= (1.0 - random_snr)
                    target[LABEL_TO_ID[mix_row['primary_label']]] += random_snr
            except Exception:
                pass
                
        y, target_len = pad_or_truncate_audio(y, self.sr, self.max_length)
        spec = audio_to_mel_spectrogram(y, sr=self.sr, n_mels=224, target_len=target_len)
        
        if self.augment and random.random() < 0.5:
            spec = spec_augment(spec)
            
        spec_tensor = torch.from_numpy(spec).float()
        
        return spec_tensor, target

def get_dataloaders(train_csv_path, audio_dir, batch_size=32):
    df = pd.read_csv(train_csv_path)
    df = df[df['primary_label'].isin(TOP_SPECIES)]
    
    # 70/15/15 split
    train_df, temp_df = train_test_split(df, test_size=0.3, stratify=df['primary_label'], random_state=42)
    val_df, test_df = train_test_split(temp_df, test_size=0.5, stratify=temp_df['primary_label'], random_state=42)
    
    print(f"Dataset Split -> Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
    
    train_ds = BirdDataset(train_df, audio_dir, augment=True)
    val_ds = BirdDataset(val_df, audio_dir, augment=False)
    test_ds = BirdDataset(test_df, audio_dir, augment=False)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    
    return train_loader, val_loader, test_loader
