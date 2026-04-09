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


from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from src.model import BirdClassifier
from src.dataset import NUM_CLASSES, ID_TO_LABEL, TOP_SPECIES, audio_to_mel_spectrogram, pad_or_truncate_audio

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

        # 2. Audio Processing Pipeline
        sr = 32000
        frames_to_read = int(sr * 5.0)
        y, orig_sr = sf.read(temp_path, frames=frames_to_read, always_2d=True)
        y = y.mean(axis=1)  # stereo to mono
        if orig_sr != sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)

        y, target_len = pad_or_truncate_audio(y, sr, max_length=5.0)

        # Shape: (1, 224, 224)
        spec = audio_to_mel_spectrogram(y, sr=sr, target_len=target_len)
        img_b64 = generate_base64_spectrogram(spec)

        # 3. Model Inference
        spec_tensor = torch.from_numpy(spec).float().unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(spec_tensor)
            probs = torch.sigmoid(outputs).squeeze(0).cpu().numpy()

        # 4. Build prediction list sorted by confidence
        predictions = [
            {"species": class_name, "confidence": float(probs[i])}
            for i, class_name in enumerate(TOP_SPECIES)
        ]
        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "filename": file.filename,
            "status": "success",
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
