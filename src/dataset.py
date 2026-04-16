import os
import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
import pandas as pd
import numpy as np
import librosa
from sklearn.model_selection import train_test_split
import random

# Extended 220 selected classes (Comprehensive list of Brazilian & Indian wildlife)
TOP_SPECIES = ['1161364', '116570', '1176823', '1595929', '209233', '22930', '22956', '22961', '22967', '22973', '22983', '22985', '23150', '23154', '23158', '23176', '23724', '24279', '24285', '24287', '24321', '244024', '25092', '25214', '326272', '41970', '43435', '47144', '476521', '516975', '555123', '555145', '555146', '64898', '65377', '65380', '66971', '67107', '67252', '70711', '738183', '74113', '74580', '760266', 'ashgre1', 'asikoe', 'astcra1', 'bafcur1', 'baffal1', 'banana', 'barant1', 'batbel1', 'baymac', 'bbwduc', 'bcwfin2', 'bkcdon', 'bkhpar', 'bladro', 'blchaw1', 'blheag1', 'blttit1', 'bncfly', 'bobfly1', 'brcmar1', 'brnowl', 'bucmot4', 'bucpar', 'bufpar', 'bunibi1', 'burowl', 'camfli1', 'chacha1', 'chbmoc1', 'chobla1', 'chvcon1', 'cibspi1', 'coffal1', 'commyn', 'compau', 'compot1', 'comtai', 'copbar', 'crbthr1', 'crebec1', 'dwatin1', 'epaori4', 'eulfly1', 'fabwre1', 'fepowl', 'ficman1', 'flawar1', 'fotfly', 'fusfly1', 'gilhum1', 'giwrai1', 'glteme1', 'grasal3', 'greani1', 'greant1', 'greela', 'grekis', 'grepot1', 'gretho2', 'greyel', 'grfdov1', 'grhtan1', 'gycwor1', 'horscr1', 'houcro', 'houspa', 'hyamac1', 'indpea', 'indrob', 'larela1', 'lesela1', 'lesgrf1', 'limpki', 'linwoo1', 'litcuc2', 'litnig1', 'mabpar', 'magant1', 'magtan2', 'masgna1', 'nacnig1', 'ocecra1', 'oliwoo1', 'orbtro3', 'orwpar', 'osprey', 'pabspi1', 'palhor3', 'paltan1', 'phecuc1', 'picpig2', 'pirfly1', 'plasla1', 'platyr1', 'plcjay1', 'pluibi1', 'purjay1', 'pursun', 'pvttyr1', 'ragmac1', 'rebscy1', 'recfin1', 'redjun', 'relser1', 'revbul', 'rewlap', 'rinkin1', 'rivwar1', 'roahaw', 'rorpar', 'rubthr1', 'rufcac2', 'rufcas2', 'rufgna3', 'rufhor2', 'rufnig1', 'ruftho1', 'ruftof1', 'ruftre', 'rumfly1', 'ruther1', 'rutjac1', 'sabspa1', 'saffin', 'saytan1', 'scadov1', 'schpar1', 'scther1', 'shcfly1', 'shshaw', 'shtnig1', 'sibtan2', 'smbani', 'smbtin1', 'sobcac1', 'sobtyr1', 'socfly1', 'sofspi1', 'souant1', 'soulap1', 'souscr1', 'spbant3', 'spispi1', 'sptnig1', 'squcuc1', 'stbwoo2', 'strcuc1', 'strher2', 'strowl1', 'swthum1', 'swtman1', 'tattin1', 'thlwre1', 'toctou1', 'trokin', 'trsowl', 'undtin1', 'varant1', 'watjac1', 'wesfie1', 'wfwduc1', 'whbant2', 'whbwar2', 'whiwoo1', 'whlspi1', 'whnjay1', 'whtdov', 'whtkin', 'whwpic1', 'y00678', 'yebcar', 'yebela1', 'yecmac', 'yecpar', 'yehcar1', 'yeofly1']
NUM_CLASSES = len(TOP_SPECIES)
LABEL_TO_ID = {label: idx for idx, label in enumerate(TOP_SPECIES)}
ID_TO_LABEL = {idx: label for label, idx in LABEL_TO_ID.items()}

def get_species_name_map(csv_path="data/combined_birds/train.csv"):
    """Creates a mapping from species code (rufgna3) to common name (Rufous-faced Gnatwren)."""
    if not os.path.exists(csv_path):
        return {code: code for code in TOP_SPECIES}
    
    df = pd.read_csv(csv_path)
    # Get unique primary_label -> common_name pairs
    mapping = df.drop_duplicates('primary_label').set_index('primary_label')['common_name'].to_dict()
    # Ensure all TOP_SPECIES have an entry
    return {code: mapping.get(code, code) for code in TOP_SPECIES}

SPECIES_TO_NAME = get_species_name_map()


def pad_or_truncate_audio(y, sr, max_length=5.0):
    target_len = int(sr * max_length)
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)))
    else:
        # Random crop instead of head-crop to expose more of the recording
        if len(y) > target_len:
            start = random.randint(0, len(y) - target_len)
            y = y[start:start + target_len]
    return y, target_len


def audio_to_mel_spectrogram(y, sr=32000, n_mels=224, target_len=None):
    """Converts a raw audio signal to a normalized Mel spectrogram of shape (3, 224, 224)."""
    if target_len is None:
        target_len = len(y)

    hop_length = int(target_len / n_mels)
    n_fft = 1024

    S = librosa.feature.melspectrogram(
        y=y, sr=sr, n_mels=n_mels,
        hop_length=hop_length, n_fft=n_fft, fmax=14000
    )
    S_dB = librosa.power_to_db(S, ref=np.max)

    # Normalize between 0 and 1
    S_min, S_max = S_dB.min(), S_dB.max()
    S_dB = (S_dB - S_min) / (S_max - S_min + 1e-6)

    # Crop or pad to exactly n_mels time steps
    if S_dB.shape[1] < n_mels:
        S_dB = np.pad(S_dB, ((0, 0), (0, n_mels - S_dB.shape[1])))
    else:
        S_dB = S_dB[:, :n_mels]

    # Shape: (3, 224, 224) — repeat mono channel 3x for pretrained ImageNet weights
    S_dB = np.expand_dims(S_dB, axis=0)
    S_dB = np.repeat(S_dB, 3, axis=0)
    return S_dB


def spec_augment(spec, max_time_mask=30, max_freq_mask=30, num_masks=2):
    """SpecAugment: frequency + time masking with configurable masks."""
    spec_aug = spec.copy()
    freq_bins, time_steps = spec_aug.shape[1], spec_aug.shape[2]

    for _ in range(num_masks):
        # Frequency masking
        f = random.randint(0, max_freq_mask)
        f0 = random.randint(0, max(1, freq_bins - f))
        spec_aug[:, f0:f0 + f, :] = 0

        # Time masking
        t = random.randint(0, max_time_mask)
        t0 = random.randint(0, max(1, time_steps - t))
        spec_aug[:, :, t0:t0 + t] = 0

    return spec_aug


def time_shift_audio(y, sr, max_shift_s=0.5):
    """Randomly shift audio in time (roll)."""
    max_shift = int(sr * max_shift_s)
    shift = random.randint(-max_shift, max_shift)
    return np.roll(y, shift)


def add_gaussian_noise(y, noise_level=0.005):
    """Add small Gaussian noise for robustness."""
    return y + noise_level * np.random.randn(len(y)).astype(y.dtype)


def mix_audio(y1, y2, snr=0.4):
    """Mix two raw audio arrays with a given SNR ratio."""
    max_len = max(len(y1), len(y2))
    y1_pad = np.pad(y1, (0, max_len - len(y1)))
    y2_pad = np.pad(y2, (0, max_len - len(y2)))
    return y1_pad * (1.0 - snr) + y2_pad * snr


class BirdDataset(Dataset):
    def __init__(self, metadata_df, audio_dir, sr=32000, max_length=5.0, augment=False):
        self.metadata = metadata_df.reset_index(drop=True)
        self.audio_dir = audio_dir
        self.sr = sr
        self.max_length = max_length
        self.augment = augment

    def __len__(self):
        return len(self.metadata)

    def _load_audio(self, file_path):
        """Load and resample an audio file. Returns zeros on failure."""
        import soundfile as sf
        try:
            frames_to_read = int(self.sr * self.max_length * 2)  # read 2× for random crop room
            y, orig_sr = sf.read(file_path, frames=frames_to_read, always_2d=True)
            y = y.mean(axis=1)
            if orig_sr != self.sr:
                y = librosa.resample(y, orig_sr=orig_sr, target_sr=self.sr)
            return y.astype(np.float32)
        except Exception:
            return np.zeros(int(self.sr * self.max_length), dtype=np.float32)

    def __getitem__(self, idx):
        row = self.metadata.iloc[idx]
        # Files are stored flat in audio_dir (no subdirectories)
        file_path = os.path.join(self.audio_dir, os.path.basename(row['filename']))

        # Build target as a single integer class index (required by CrossEntropyLoss)
        label = row['primary_label']
        target = torch.tensor(
            LABEL_TO_ID.get(label, 0),
            dtype=torch.long
        )

        y = self._load_audio(file_path)

        # --- Augmentations (audio domain) ---
        if self.augment:
            # 1. Time shift
            if random.random() < 0.3:
                y = time_shift_audio(y, self.sr)

            # 2. Gaussian noise
            if random.random() < 0.25:
                y = add_gaussian_noise(y)

        y, target_len = pad_or_truncate_audio(y, self.sr, self.max_length)
        spec = audio_to_mel_spectrogram(y, sr=self.sr, n_mels=224, target_len=target_len)

        # --- Augmentations (spectrogram domain) ---
        if self.augment and random.random() < 0.5:
            spec = spec_augment(spec, num_masks=random.choice([1, 2]))

        return torch.from_numpy(spec).float(), target


def build_sampler(train_df):
    """Weighted sampler to handle class imbalance."""
    counts = train_df['primary_label'].value_counts()
    weights = train_df['primary_label'].map(lambda lbl: 1.0 / counts.get(lbl, 1)).values
    return WeightedRandomSampler(
        weights=torch.tensor(weights, dtype=torch.float32),
        num_samples=len(weights),
        replacement=True
    )


def get_dataloaders(train_csv_path, audio_dir, batch_size=32):
    df = pd.read_csv(train_csv_path)
    df = df[df['primary_label'].isin(TOP_SPECIES)].copy()

    # Custom train/val/test split to avoid errors on rare classes
    train_dfs, val_dfs, test_dfs = [], [], []
    for label, group in df.groupby('primary_label'):
        n = len(group)
        if n == 1:
            train_dfs.append(group)
        elif n == 2:
            train_dfs.append(group.iloc[:1])
            val_dfs.append(group.iloc[1:])
        elif n == 3:
            train_dfs.append(group.iloc[:1])
            val_dfs.append(group.iloc[1:2])
            test_dfs.append(group.iloc[2:])
        elif n == 4:
            train_dfs.append(group.iloc[:2])
            val_dfs.append(group.iloc[2:3])
            test_dfs.append(group.iloc[3:])
        else:
            tr, temp = train_test_split(group, test_size=0.3, random_state=42)
            v, te = train_test_split(temp, test_size=0.5, random_state=42)
            train_dfs.append(tr)
            val_dfs.append(v)
            test_dfs.append(te)

    train_df = pd.concat(train_dfs).sample(frac=1, random_state=42).reset_index(drop=True)
    val_df = pd.concat(val_dfs).sample(frac=1, random_state=42).reset_index(drop=True)
    test_df = pd.concat(test_dfs).sample(frac=1, random_state=42).reset_index(drop=True)

    print(f"Dataset split → Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

    train_ds = BirdDataset(train_df, audio_dir, augment=True)
    val_ds   = BirdDataset(val_df,   audio_dir, augment=False)
    test_ds  = BirdDataset(test_df,  audio_dir, augment=False)

    sampler = build_sampler(train_df)

    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=sampler,   num_workers=0, pin_memory=True)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False,     num_workers=0, pin_memory=True)
    test_loader  = DataLoader(test_ds,  batch_size=batch_size, shuffle=False,     num_workers=0, pin_memory=True)

    return train_loader, val_loader, test_loader