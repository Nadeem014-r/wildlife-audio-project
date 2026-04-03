import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

def visualize_audio(file_path, output_img_path):
    # Load audio file
    print(f"Loading {file_path}...")
    y, sr = librosa.load(file_path, sr=None)
    
    # Setup plot
    plt.figure(figsize=(10, 8))
    
    # 1. Waveform
    plt.subplot(2, 1, 1)
    librosa.display.waveshow(y, sr=sr)
    plt.title('Waveform')
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')
    
    # 2. Mel Spectrogram
    plt.subplot(2, 1, 2)
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    S_dB = librosa.power_to_db(S, ref=np.max)
    img = librosa.display.specshow(S_dB, x_axis='time', y_axis='mel', sr=sr, fmax=8000)
    plt.colorbar(img, format='%+2.0f dB')
    plt.title('Mel-frequency spectrogram')
    
    plt.tight_layout()
    plt.savefig(output_img_path)
    plt.close()
    print(f"Saved visualization to {output_img_path}")

if __name__ == '__main__':
    audio_path = "data/birdclef-2026/train_audio/rubthr1/XC1003072.ogg"
    output_path = "/Users/harshanand/.gemini/antigravity/brain/4a234e41-83ce-4150-a8e6-3ec97e3801d8/sample_mel_spectrogram.png"
    visualize_audio(audio_path, output_path)
