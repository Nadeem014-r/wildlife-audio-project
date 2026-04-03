import os
import io
import base64
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

# Setup CORS (Step 4.4)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local react development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model Configuration
# Force CPU to avoid deadlocking the Apple Silicon GPU while the training background process uses it
device = torch.device('cpu')
print(f"Loading model for Inference on {device}...")
model = BirdClassifier(num_classes=NUM_CLASSES)
model_path = "models/best_model.pth"
if os.path.exists(model_path):
    model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

def generate_base64_spectrogram(spec_log_db):
    """ Converts a spectrogram numpy array to a base64 encoded PNG """
    plt.figure(figsize=(8, 4))
    # spec_log_db is shape (1, 224, 224)
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
    # 1. Read Audio File Buffer
    content = await file.read()
    temp_file = "/tmp/temp_audio.ogg"
    with open(temp_file, "wb") as f:
        f.write(content)
        
    try:
        # 2. Audio Processing Pipeline
        sr = 32000
        frames_to_read = int(sr * 5.0)
        y, orig_sr = sf.read(temp_file, frames=frames_to_read, always_2d=True)
        y = y.mean(axis=1) # stereo to mono
        if orig_sr != sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)
            
        y, target_len = pad_or_truncate_audio(y, sr, max_length=5.0)
        
        # Extracted Array: shape (1, 224, 224)
        spec = audio_to_mel_spectrogram(y, sr=sr, target_len=target_len)
        
        # Generate base64 spectrogram image
        img_b64 = generate_base64_spectrogram(spec)
        
        # 3. Model Inference
        spec_tensor = torch.from_numpy(spec).float().unsqueeze(0).to(device) # Shape: (1, 1, 224, 224)
        
        with torch.no_grad():
            outputs = model(spec_tensor)
            probs = torch.sigmoid(outputs).squeeze(0).cpu().numpy()
            
        # 4. Generate JSON Predictions Map
        predictions = []
        for i, class_name in enumerate(TOP_SPECIES):
            predictions.append({
                "species": class_name,
                "confidence": float(probs[i])
            })
            
        # Sort by highest confidence
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        return {
            "filename": file.filename,
            "status": "success",
            "predictions": predictions[:5], # Return top 5 matches
            "spectrogram_image": img_b64
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.get("/")
def health_check():
    return {"status": "online", "model_loaded": os.path.exists("models/best_model.pth")}

