import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


import io
import base64
import tempfile
import torch
import numpy as np
import soundfile as sf
import librosa
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pathlib import Path


from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from src.model import BirdClassifier
from src.dataset import NUM_CLASSES, ID_TO_LABEL, TOP_SPECIES, SPECIES_TO_NAME, audio_to_mel_spectrogram, pad_or_truncate_audio

app = FastAPI(title="BirdCLEF Detection API")

# Setup CORS — allow all origins for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model — force CPU for stability
device = torch.device('cpu')
print(f"Loading model for Inference on {device}...")
model = BirdClassifier(num_classes=NUM_CLASSES)
model_path = "models/best_model.pth"
if os.path.exists(model_path):
    model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

def generate_base64_spectrogram(spec_log_db):
    """Converts a spectrogram numpy array to a base64 encoded PNG."""
    plt.figure(figsize=(8, 4))
    plt.imshow(spec_log_db[0], aspect='auto', origin='lower')
    plt.axis('off')
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight', pad_inches=0)
    plt.close()
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_b64}"

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Use Python's tempfile module — works cross-platform (Windows, Mac, Linux).
    # The original code used /tmp/temp_audio.ogg which is a Linux-only path
    # and causes "failed to fetch" / FileNotFoundError on Windows.
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = tmp.name

    try:
        # 1. Write uploaded audio to the cross-platform temp file
        content = await file.read()
        tmp.write(content)
        tmp.close()

        # 2. Audio Processing Pipeline (Load full audio)
        sr = 32000
        # Read full file (no longer limiting to 5s at the start)
        y, orig_sr = sf.read(temp_path, always_2d=True)
        y = y.mean(axis=1)  # stereo to mono
        if orig_sr != sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)

        # 3. Sliding Window Prediction
        window_size = 5.0 # seconds
        stride = 2.5      # seconds (50% overlap)
        window_samples = int(window_size * sr)
        stride_samples = int(stride * sr)

        # Pad audio if it's shorter than 5 seconds
        if len(y) < window_samples:
            y = np.pad(y, (0, window_samples - len(y)))

        # Extract windows
        num_windows = max(1, int((len(y) - window_samples) / stride_samples) + 1)
        # Limit total windows to prevent timeout/OOM (max ~40 windows = ~100s audio)
        num_windows = min(num_windows, 40) 

        print(f"Analyzing {len(y)/sr:.1f}s audio across {num_windows} windows...")

        all_probs = []
        last_spec = None

        for i in range(num_windows):
            start = i * stride_samples
            end = start + window_samples
            chunk = y[start:end]
            
            # Ensure chunk is exactly window_samples (padding last chunk if needed)
            if len(chunk) < window_samples:
                chunk = np.pad(chunk, (0, window_samples - len(chunk)))

            spec = audio_to_mel_spectrogram(chunk, sr=sr, target_len=window_samples)
            last_spec = spec # Keep the last one for visual display if needed
            
            spec_tensor = torch.from_numpy(spec).float().unsqueeze(0).to(device)
            with torch.no_grad():
                outputs = model(spec_tensor)
                probs = torch.softmax(outputs, dim=1).squeeze(0).cpu().numpy()
                all_probs.append(probs)

        # Aggregate Results (Max-pooling: if a bird is found in ANY window, we count it)
        aggregated_probs = np.max(all_probs, axis=0)
        img_b64 = generate_base64_spectrogram(last_spec)

        # 4. Build prediction list sorted by confidence
        predictions = [
            {
                "species": class_code, 
                "common_name": SPECIES_TO_NAME.get(class_code, class_code),
                "confidence": float(aggregated_probs[i])
            }
            for i, class_code in enumerate(TOP_SPECIES)
        ]
        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "filename": file.filename,
            "status": "success",
            "duration": f"{len(y)/sr:.1f}s",
            "windows_analyzed": num_windows,
            "predictions": predictions[:5],
            "spectrogram_image": img_b64,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/")
def health_check():
    return {"status": "online", "model_loaded": os.path.exists("models/best_model.pth")}


# ─── Audio Sample Endpoint ────────────────────────────────────────────────────
TRAIN_AUDIO_DIR = Path("data/combined_birds/audio")

@app.get("/audio-sample/{species_code}")
def audio_sample(species_code: str):
    """Serve a sample .ogg audio file for a given species code from the flat audio directory."""
    # Find all files belonging to this species in the data
    df = pd.read_csv("data/combined_birds/train.csv")
    species_files = df[df['primary_label'] == species_code]['filename'].tolist()
    
    if not species_files:
        raise HTTPException(status_code=404, detail=f"No audio found for species: {species_code}")
    
    # Use the first available file
    sample_filename = os.path.basename(species_files[0])
    file_path = TRAIN_AUDIO_DIR / sample_filename
    
    if not file_path.exists():
         raise HTTPException(status_code=404, detail=f"File not found on disk: {sample_filename}")
         
    return FileResponse(file_path, media_type="audio/ogg", filename=f"{species_code}_sample.ogg")
