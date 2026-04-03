import pprint
from fastapi.testclient import TestClient
from src.api import app

client = TestClient(app)

def test_api():
    print("Testing Root Health Check Endpoint:")
    response = client.get("/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}\n")
    
    print("Testing /predict Endpoint (Uploading OGG File):")
    audio_path = "data/birdclef-2026/train_audio/rubthr1/XC1003072.ogg"
    
    with open(audio_path, "rb") as f:
        # Simulate form-data file upload
        files = {"file": ("XC1003072.ogg", f, "audio/ogg")}
        response = client.post("/predict", files=files)
        
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Filename Processed: {data.get('filename')}")
        print(f"Status: {data.get('status')}")
        if data.get('status') == 'error':
            print(f"Server Error Message: {data.get('message')}")
        
        print("\nPredictions returned:")
        pprint.pprint(data.get('predictions'))
        
        image_data = data.get('spectrogram_image')
        print(f"\nSpectrogram Base64 Generated? {'Yes' if image_data and 'data:image/png;base64' in image_data else 'No'}")
        print(f"Base64 String Length: {len(image_data) if image_data else 0} chars")
    else:
        print(f"Error: {response.text}")
        
if __name__ == "__main__":
    test_api()
