"""
audit_data.py  — Find and optionally delete corrupted audio files.
Run from the project root:
    python audit_data.py
"""
import os
import soundfile as sf
import pandas as pd

TRAIN_CSV = "data/combined_birds/train.csv"
AUDIO_DIR = "data/combined_birds/audio"

df = pd.read_csv(TRAIN_CSV)
print(f"Total rows in CSV: {len(df)}")

bad_files = []
missing_files = []

for idx, row in df.iterrows():
    fpath = os.path.join(AUDIO_DIR, row['filename'])
    if not os.path.exists(fpath):
        missing_files.append(fpath)
        continue
    try:
        sf.read(fpath, frames=1000)
    except Exception as e:
        bad_files.append((fpath, str(e)))

print(f"\nMissing files:   {len(missing_files)}")
print(f"Corrupted files: {len(bad_files)}")

if bad_files:
    print("\nSample of corrupted files:")
    for path, err in bad_files[:10]:
        print(f"  {path}  |  {err}")

    print(f"\nWrite bad file list to: bad_files.txt")
    with open("bad_files.txt", "w") as f:
        for path, err in bad_files:
            f.write(f"{path}\t{err}\n")

    # Remove corrupted rows from CSV and save a clean version
    bad_set = {p for p, _ in bad_files} | set(missing_files)
    clean_df = df[df['filename'].apply(
        lambda fn: os.path.join(AUDIO_DIR, fn) not in bad_set
    )]
    clean_csv = TRAIN_CSV.replace(".csv", "_clean.csv")
    clean_df.to_csv(clean_csv, index=False)
    print(f"Clean CSV saved to: {clean_csv}  ({len(clean_df)} rows, removed {len(df) - len(clean_df)})")
    print(f"\nTo retrain with clean data, update train.py to use: {clean_csv}")
else:
    print("\nNo corrupted files found. Data is clean!")
