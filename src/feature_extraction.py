import os
import librosa
import numpy as np

DATA_PATH = "data"

X = []
y = []

MAX_LEN = 128

# 🔥 LIMIT NUMBER OF SPECIES
MAX_CLASSES = 8
class_count = 0

for label in os.listdir(DATA_PATH):
    
    if class_count >= MAX_CLASSES:
        break

    label_path = os.path.join(DATA_PATH, label)
    
    if os.path.isdir(label_path):

        for file in os.listdir(label_path):
            
            if file.endswith(".ogg"):
                
                file_path = os.path.join(label_path, file)
                
                try:
                    # 1. Load audio (5 sec)
                    audio, sr = librosa.load(file_path, duration=5)
                    
                    # 2. Pad if short
                    if len(audio) < sr * 5:
                        audio = np.pad(audio, (0, sr * 5 - len(audio)))
                    
                    # 3. Spectrogram
                    spectrogram = librosa.feature.melspectrogram(
                        y=audio, sr=sr, n_mels=128
                    )
                    
                    spectrogram_db = librosa.power_to_db(
                        spectrogram, ref=np.max
                    )
                    
                    # 4. Fix size
                    if spectrogram_db.shape[1] < MAX_LEN:
                        pad_width = MAX_LEN - spectrogram_db.shape[1]
                        spectrogram_db = np.pad(
                            spectrogram_db, ((0,0),(0,pad_width))
                        )
                    else:
                        spectrogram_db = spectrogram_db[:, :MAX_LEN]
                    
                    # 5. Store
                    X.append(spectrogram_db)
                    y.append(label)
                
                except Exception as e:
                    print("Error:", file)

        # 🔥 increase class count AFTER processing one folder
        class_count += 1

# Convert to numpy
X = np.array(X)
y = np.array(y)

print("Features shape:", X.shape)
print("Labels shape:", y.shape)

# 🔥 Save dataset
np.savez("data/dataset.npz", X=X, y=y)

print("Dataset saved successfully!")