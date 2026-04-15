import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import io
import base64
import torch
import numpy as np
import soundfile as sf
import librosa
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.model import BirdClassifier
from src.dataset import (
    NUM_CLASSES, ID_TO_LABEL, TOP_SPECIES,
    audio_to_mel_spectrogram, pad_or_truncate_audio
)

app = FastAPI(title="BirdCLEF Detection API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Model loading ────────────────────────────────────────────────────────────

device = torch.device('cpu')   # Force CPU to avoid GPU contention with training
print(f"Loading inference model on {device}…")

model = BirdClassifier(num_classes=NUM_CLASSES)
model_path = "models/best_model.pth"
_model_loaded = False

if os.path.exists(model_path):
    try:
        model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
        _model_loaded = True
        print("Model weights loaded successfully.")
    except Exception as e:
        print(f"\n{'!' * 60}")
        print("ARCHITECTURE MISMATCH DETECTED")
        print(f"Error: {str(e)[:100]}...")
        print("\nThe code has been upgraded to EfficientNet-B2, but the existing")
        print("'best_model.pth' is incompatible. Please re-run training:")
        print("  python -m src.train --fast-dev-run")
        print(f"{'!' * 60}\n")
        _model_loaded = False
else:
    print(f"WARNING: {model_path} not found — serving untrained model.")

model.to(device)
model.eval()

# Optimal inference threshold (can be updated after running evaluate.py)
INFERENCE_THRESHOLD = float(os.environ.get("BIRD_THRESHOLD", "0.5"))


# ─── Helpers ─────────────────────────────────────────────────────────────────

def generate_spectrogram_b64(spec_3ch: np.ndarray) -> str:
    """Convert a (3, H, W) spectrogram array to a base64-encoded PNG."""
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.imshow(spec_3ch[0], aspect='auto', origin='lower', cmap='viridis')
    ax.axis('off')
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    return "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')


def load_audio_bytes(content: bytes, target_sr: int = 32000, max_s: float = 5.0) -> np.ndarray:
    """Write content to a temp file, load, resample, and return a float32 mono array."""
    tmp = "/tmp/bird_upload.ogg"
    with open(tmp, "wb") as f:
        f.write(content)
    try:
        frames = int(target_sr * max_s)
        y, orig_sr = sf.read(tmp, frames=frames, always_2d=True)
        y = y.mean(axis=1)
        if orig_sr != target_sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=target_sr)
        return y.astype(np.float32)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "status": "online",
        "model_loaded": _model_loaded,
        "inference_threshold": INFERENCE_THRESHOLD,
        "num_classes": NUM_CLASSES,
        "species": TOP_SPECIES,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    allowed = {'audio/ogg', 'audio/wav', 'audio/flac', 'audio/mpeg', 'application/octet-stream'}
    if file.content_type and file.content_type not in allowed:
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {file.content_type}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file received.")

    try:
        SR = 32000
        y = load_audio_bytes(content, target_sr=SR, max_s=5.0)
        y, target_len = pad_or_truncate_audio(y, SR, max_length=5.0)
        spec = audio_to_mel_spectrogram(y, sr=SR, target_len=target_len)    # (3, 224, 224)

        spec_tensor = torch.from_numpy(spec).float().unsqueeze(0).to(device)  # (1, 3, 224, 224)
        with torch.no_grad():
            logits = model(spec_tensor)
            probs  = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()           # (C,)

        predictions = []
        for i, species in enumerate(TOP_SPECIES):
            conf = float(probs[i])
            predictions.append({
                "species":    species,
                "confidence": round(conf, 4),
                "detected":   conf >= INFERENCE_THRESHOLD,
            })

        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        # Detected species above threshold
        detected = [p for p in predictions if p["detected"]]

        return {
            "filename":          file.filename,
            "status":            "success",
            "top5_predictions":  predictions[:5],
            "detected_species":  detected,
            "threshold_used":    INFERENCE_THRESHOLD,
            "spectrogram_image": generate_spectrogram_b64(spec),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")