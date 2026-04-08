import wave, struct, math, os
os.makedirs('frontend/public/sounds', exist_ok=True)
sampleRate = 44100
duration = 1.2
for i in range(1, 10):
    obj = wave.open(f'frontend/public/sounds/bird{i}.wav','w')
    obj.setnchannels(1)
    obj.setsampwidth(2)
    obj.setframerate(sampleRate)
    for j in range(int(sampleRate * duration)):
        t = j / sampleRate
        freq = 1500 + i * 300 + 800 * math.sin(2 * math.pi * (10 + i * 2) * t)
        value = int(32767.0 * math.sin(2.0 * math.pi * freq * t))
        value = int(value * math.exp(-3 * t))
        obj.writeframesraw(struct.pack('<h', value))
    obj.close()
print("Perfect RIFF WAV generated")
