# audio/*.wav（Gemini TTS 原檔，24 kHz）→ vo/（修掉頭尾靜音，build_timeline.py 用）
#                                       → vo44/（重新取樣到 44.1 kHz，mkaudio.py 混音用）
# 為什麼要重新取樣：混音時間軸是 44.1 kHz，直接貼 24 kHz 的旁白會讓聲音加快 1.84 倍、音調變高。
import wave, glob, os, subprocess, numpy as np
os.makedirs('vo', exist_ok=True); os.makedirs('vo44', exist_ok=True)
for f in sorted(glob.glob('audio/*.wav')):
    w = wave.open(f); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16); w.close()
    x = np.abs(a.astype(np.float32)) / 32768
    idx = np.where(x > 0.012)[0]
    s = max(0, idx[0] - int(.08 * sr)); e = min(len(a), idx[-1] + int(.25 * sr))
    out = 'vo/' + os.path.basename(f)
    with wave.open(out, 'w') as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(a[s:e].tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', out, '-ar', '44100', '-ac', '1', 'vo44/' + os.path.basename(f)], check=True)
    print(os.path.basename(f), round((e - s) / sr, 2), 's')
