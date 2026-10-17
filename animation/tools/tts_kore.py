# 用 Gemini 3.8 Flash TTS（Kore）逐場景生成旁白 → 修頭尾靜音 → 重新取樣為 48 kHz 單聲道 → 寫登記檔
# 用法：python tools/tts_kore.py [場景id ...]   不帶參數＝只補缺少或台詞已變的場景；帶 id＝強制重做
# 為什麼要登記檔（audio/<id>.wav.json）：pipeline 以「台詞文字＋音檔 sha256」確認旁白沒有過期，
# 因此外部 TTS 只要照這個格式登記，就不用手動設 externalVoiceVerified。
import json, subprocess, os, sys, hashlib, shutil
from concurrent.futures import ThreadPoolExecutor
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTS = os.environ.get('GEMINI_TTS_SCRIPT', 'K:/antigravity/scripts/gemini_tts.py')   # 作者本機路徑，請改成你的
film = json.load(open(os.path.join(ROOT, 'film.json'), encoding='utf-8'))
force = set(sys.argv[1:])
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'audio_raw'), exist_ok=True)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()

def one(s):
    sid, text = s['id'], s['narration'].strip()
    out = os.path.join(ROOT, 'audio', sid + '.wav'); rec = out + '.json'
    raw = os.path.join(ROOT, 'audio_raw', sid + '.wav')
    if sid not in force and os.path.exists(out) and os.path.exists(rec):
        r = json.load(open(rec, encoding='utf-8'))
        if r.get('text') == text and r.get('audioSha256') == sha(out): return sid, 'cached'
    err = ''
    for _ in range(3):
        if os.path.exists(raw): os.remove(raw)
        r = subprocess.run([sys.executable, TTS, text, '-v', 'Kore', '-o', raw], capture_output=True, text=True, encoding='utf-8',
                           env={**os.environ, 'PYTHONIOENCODING': 'utf8'})
        err = r.stderr[-200:]
        if os.path.exists(raw) and os.path.getsize(raw) > 10000: break
    else:
        return sid, 'FAIL ' + err
    # 修頭尾靜音（頭尾各留一點呼吸），重新取樣 48k/單聲道
    flt = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.2,areverse'
    tmp = out + '.tmp.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', flt, '-ar', '48000', '-ac', '1', tmp], check=True)
    shutil.move(tmp, out)
    json.dump({'key': hashlib.sha256(text.encode()).hexdigest(), 'engine': 'gemini-3.8-flash-tts', 'text': text, 'voice': 'Kore', 'rate': None,
               'audioSha256': sha(out)}, open(rec, 'w', encoding='utf-8'), ensure_ascii=False)
    return sid, 'ok'

with ThreadPoolExecutor(3) as ex:
    for sid, st in ex.map(one, film['scenes']): print(sid, st)
