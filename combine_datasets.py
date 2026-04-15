import os
import shutil
import pandas as pd
from pathlib import Path

# Paths
BRAZIL_CSV = "data/birdclef-2026/train.csv"
BRAZIL_AUDIO_DIR = "data/birdclef-2026/train_audio"

INDIAN_CSV = "data/indian_birds/train.csv"
INDIAN_AUDIO_DIR = "data/indian_birds/audio"

OUT_DIR = "data/combined_birds"
OUT_AUDIO_DIR = os.path.join(OUT_DIR, "audio")
OUT_CSV = os.path.join(OUT_DIR, "train.csv")

os.makedirs(OUT_AUDIO_DIR, exist_ok=True)

# 1. Combine CSVs
df_brazil = pd.read_csv(BRAZIL_CSV)
df_indian = pd.read_csv(INDIAN_CSV)

df_combined = pd.concat([df_brazil, df_indian], ignore_index=True)
df_combined.to_csv(OUT_CSV, index=False)
print(f"Combined CSV created at {OUT_CSV} with {len(df_combined)} rows.")

# 2. Symlink/Copy audio files to avoid duplicates but unify path
def ingest_audio(df, src_dir):
    copied = 0
    missing = 0
    for idx, row in df.iterrows():
        # brazil dataset might have subdirectories (e.g. rubthr1/XC123.ogg)
        # indian dataset has flat filenames (e.g. indpea_123.ogg)
        filename = row['filename']
        src_path = os.path.join(src_dir, filename)
        
        # In brazil dataset, sometimes path is in a class subdir
        if not os.path.exists(src_path):
            # Check if it was extracted flat
            flat_path = os.path.join(src_dir, os.path.basename(filename))
            if os.path.exists(flat_path):
                src_path = flat_path
            else:
                missing += 1
                continue
                
        # We will flatten them in the combined structure to filename
        dest_filename = os.path.basename(filename)
        dest_path = os.path.join(OUT_AUDIO_DIR, dest_filename)
        
        try:
            if not os.path.exists(dest_path):
                # Using absolute symlinks or hardlinks for safety in python script, 
                # but direct shutil.copy is universally robust and audio size here is small.
                shutil.copy(src_path, dest_path)
                copied += 1
        except Exception as e:
            print(f"Failed to copy {src_path} -> {dest_path}: {e}")
            
    print(f"Ingested {copied} files from {src_dir}. ({missing} missing locally)")

print("Ingesting Brazilian dataset...")
ingest_audio(df_brazil, BRAZIL_AUDIO_DIR)

print("Ingesting Indian dataset...")
ingest_audio(df_indian, INDIAN_AUDIO_DIR)

print(f"Dataset completely combined in {OUT_DIR}!")
