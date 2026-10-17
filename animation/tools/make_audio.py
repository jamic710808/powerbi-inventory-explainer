# 原創配樂＋動作音效（純 numpy 合成，無版權問題）。依 timeline.json 與 cues.json 對點。
# 產出：audio/music.wav（暖色輕快小品，說話時自動壓低）、audio/sfx.wav（對準旁白句子的動作音效），皆 48 kHz 立體聲、長度＝全片。
import json, os, sys, wave
import numpy as np
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'timeline.json'), encoding='utf-8'))
CU = json.load(open(os.path.join(ROOT, 'cues.json'), encoding='utf-8'))
FPS = TL['fps']; DUR = TL['totalFrames'] / FPS; N = int(round(DUR * SR))
rng = np.random.default_rng(7)
SC = {s['id']: s for s in TL['scenes']}

def when(sid, phrase, off=0.0, end=False):
    """場景 sid 中含 phrase 那一句的起（或訖）時間（全片秒數）＋偏移。"""
    s = SC[sid]; v0 = s['voiceStartFrame'] / FPS
    g = next((x for x in CU[sid]['segments'] if phrase in x['text']), None)
    if g is None: raise SystemExit(f'找不到 {sid}「{phrase}」')
    return v0 + (g['end'] if end else g['start']) + off

# ---------- 合成基本件 ----------
def env_ad(n, a=.003, d=.2, k=None):
    t = np.arange(n) / SR; e = np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d); return e
def sine(f, n, ph=0): return np.sin(2 * np.pi * f * np.arange(n) / SR + ph)
def lp(x, fc):  # 一階低通
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lp_fast(x, fc):
    # 向量化近似：滑動平均
    k = max(1, int(SR / (2 * fc))); c = np.cumsum(np.pad(x, (k, 0))); return (c[k:] - c[:-k]) / k
def hp(x, fc): return x - lp_fast(x, fc)
def noise(n): return rng.standard_normal(n)
def pan(x, p):  # p -1..1
    l = np.sqrt((1 - p) / 2) * x * 1.414 * .7071; r = np.sqrt((1 + p) / 2) * x * 1.414 * .7071; return np.stack([l, r], 1)

def pluck(f, dur=1.0, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / .5) + .35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .22) + .14 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / .10) + .08 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-t / .05))
    y *= np.minimum(t / .002, 1); return y * vel
def bass(f, dur=.5):
    n = int(dur * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / .3) * np.minimum(t / .01, 1); return y
def pad(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.003 * t) + .25 * np.sin(2 * np.pi * 2 * f * t))
    e = np.minimum(t / .6, 1) * np.minimum((dur - t) / .8, 1); return y * e

# ---------- 配樂 ----------
def make_music():
    bpm = 104; beat = 60 / bpm; bar = 4 * beat
    nm = lambda m: 440 * 2 ** ((m - 69) / 12)
    # C – G – Am – F（明亮、溫暖）；每小節：低音＋八分音符分解和弦＋柔和 pad
    chords = [([48, 55, 60, 64, 67], 36), ([43, 50, 55, 59, 62], 31), ([45, 52, 57, 60, 64], 33), ([41, 48, 53, 57, 60], 29)]
    m = np.zeros((N, 2))
    t_bar = 0.0; bi = 0
    while t_bar < DUR + bar:
        notes, bassn = chords[bi % 4]
        i0 = int(t_bar * SR)
        def add(sig, t0, gain, p=0.0):
            i = int(t0 * SR);
            if i >= N: return
            seg = pan(sig * gain, p); e = min(N - i, len(seg)); m[i:i + e] += seg[:e]
        add(bass(nm(bassn), beat * 1.9), t_bar, .20); add(bass(nm(bassn), beat * 1.9), t_bar + 2 * beat, .16)
        arp = [0, 2, 3, 4, 3, 2, 1, 2]
        for j, a in enumerate(arp):
            f = nm(notes[a] + 12); add(pluck(f, 1.0, 1.0), t_bar + j * beat / 2, .10 + .02 * (j % 2 == 0), -.35 + .1 * (j % 5))
        # 小搖鈴（反拍）
        for j in range(4):
            s = hp(noise(int(.05 * SR)), 5000) * np.exp(-np.arange(int(.05 * SR)) / (.012 * SR)); add(s, t_bar + (j + .5) * beat, .035, .3)
        add(pad(nm(notes[1] + 12), bar + .3), t_bar, .05, 0); add(pad(nm(notes[3]), bar + .3), t_bar, .04, 0)
        t_bar += bar; bi += 1
    m = m[:N]
    m *= 0.055 / (np.sqrt(np.mean(m[int(2 * SR):int(10 * SR)] ** 2)) + 1e-9)   # 先歸一化，之後才壓低，避免被抵銷
    # 淡入 1.6 s、片尾淡出（片尾字卡處回到明亮和弦收尾）
    t = np.arange(N) / SR; m *= np.minimum(t / 1.6, 1)[:, None]
    m *= np.minimum((DUR - t) / 2.2, 1)[:, None].clip(0, 1)
    # 說話時壓低（約 −11 dB），前後平滑
    duck = np.ones(N)
    for s in TL['scenes']:
        if not s['voiceFrames']: continue
        a = s['voiceStartFrame'] / FPS - .15; b = (s['voiceStartFrame'] + s['voiceFrames']) / FPS + .25
        i0, i1 = max(0, int(a * SR)), min(N, int(b * SR)); duck[i0:i1] = .38
    k = int(.35 * SR); duck = lp_fast(np.pad(duck, (k, k), mode='edge'), 2.2)[k:k + N]
    # 最後一場收尾字卡（旁白結束後）：音樂回升
    last = TL['scenes'][-1]; tend = (last['voiceStartFrame'] + last['voiceFrames']) / FPS + .3
    swell = np.clip((t - tend) / .8, 0, 1) * .55
    m *= (duck + swell * (1 - duck))[:, None]
    return m

# ---------- 音效 ----------
sfx = np.zeros((N, 2))
def put(sig, t0, gain=1.0, p=0.0):
    i = int(t0 * SR)
    if i < 0 or i >= N: return
    seg = pan(sig * gain, p); e = min(N - i, len(seg)); sfx[i:i + e] += seg[:e]
def pop_(f0=700, f1=320, d=.09, g=1.0): n = int(.25 * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / .03); ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.exp(-t / d) * g
def tick(g=1.0, f=1800): n = int(.05 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) * np.exp(-t / .006) + .3 * hp(noise(n), 2500) * np.exp(-t / .004)) * g
def thud(g=1.0, f=95): n = int(.4 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * (f * .6 + f * .4 * np.exp(-t / .05)) * t) * np.exp(-t / .12) + .25 * lp_fast(noise(n), 400) * np.exp(-t / .04)) * g
def whoosh(d=.35, g=1.0, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); y = lp_fast(x, 1500) * 2; sw = (np.sin(np.pi * t / d) ** 2); return hp(y, 250) * sw * g
def ding(f=1318, g=1.0, d=.5): n = int(1.2 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .1)) * np.exp(-t / d) * np.minimum(t / .002, 1) * g
def splash(g=1.0): n = int(.5 * SR); t = np.arange(n) / SR; return lp_fast(noise(n), 3500) * np.exp(-t / .12) * g
def bang(g=1.0): n = int(.5 * SR); t = np.arange(n) / SR; return (noise(n) * np.exp(-t / .05) * .5 + np.sin(2 * np.pi * 120 * t) * np.exp(-t / .15)) * g
def knock(g=1.0): n = int(.18 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 210 * t) * np.exp(-t / .03) + .3 * lp_fast(noise(n), 1200) * np.exp(-t / .015)) * g
def bwoop(g=1.0, up=True): n = int(.3 * SR); t = np.arange(n) / SR; f = 220 * np.exp((np.log(900 / 220) if up else np.log(180 / 700)) * (t / .3)) if up else 700 * np.exp(np.log(180 / 700) * (t / .3)); ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.exp(-t / .2) * np.minimum(t / .005, 1) * g
def chime(g=1.0): return sum(ding(f, .6, .6) * 1 for f in [])  # 保留

def S(sid, phrase, off=0.0, end=False): return when(sid, phrase, off, end)
def build_sfx():
    # 場景轉場：輕微 whoosh
    for s in TL['scenes'][1:]: put(whoosh(.38, .14), s['startFrame'] / FPS - .08, 1.0)
    # s01
    t = S('s01-monday', '老闆衝進倉庫'); put(thud(.8), t + .35); put(whoosh(.3, .5), t);
    t = S('s01-monday', '咖啡灑了一半', .0); put(splash(.5), t + .12);
    t = S('s01-monday', '阿倉！'); put(bang(.8), t);
    t = S('s01-monday', '庫存到底好不好'); [put(pop_(900, 500, .08, .35), t + i * .18) for i in range(3)]
    t = S('s01-monday', '阿倉打開一份報表'); put(whoosh(.3, .4), t); [put(pop_(700 + 40 * i, 420, .07, .22), t + .55 + i * .09) for i in range(8)]
    t = S('s01-monday', '八頁'); put(ding(1568, .35, .3), t)
    t = S('s01-monday', '六個問題'); [put(pop_(800 + 60 * i, 450, .07, .25), t + i * .1) for i in range(6)]
    # s02
    for ph in ['在庫七十八點五萬', '週轉二十二點五天', '缺貨率百分之八', '準確率九成三多']: put(pop_(820, 380, .09, .4), S('s02-calendar', ph))
    t = S('s02-calendar', '老闆剛放心'); put(ding(1046, .25, .5), t + .2)
    t = S('s02-calendar', '翻頁就驚呼'); put(whoosh(.35, .6), t); put(bwoop(.5, True), t + .5)
    t = S('s02-calendar', '五十八點九萬'); put(whoosh(.3, .45), t - .2)
    t = S('s02-calendar', '少了二十萬'); put(bang(.9), t + .05); put(ding(740, .4, .25), t + .05)
    t = S('s02-calendar', '阿倉指指日期'); put(pop_(900, 450, .09, .4), t)
    t = S('s02-calendar', '這頁只算到五月一日'); put(tick(.6, 1500), t + .1)
    t = S('s02-calendar', '封面算到八月底'); put(tick(.6, 1700), t + .1)
    t = S('s02-calendar', '沒掉錢'); [put(ding(f, .35, .45), t + .15 + i * .09) for i, f in enumerate([784, 988, 1175, 1568])]
    t = S('s02-calendar', '只是日曆翻了四個月'); [put(tick(.7, 1400 + i * 120), t + i * .22) for i in range(5)]
    # s03
    t = S('s03-money', '五十八點九萬裡'); put(whoosh(.4, .5), t - .1)
    put(pop_(760, 360, .09, .4), S('s03-money', '可用四十八點三萬', .35)); put(pop_(640, 300, .09, .4), S('s03-money', '殘次十點六萬', .25))
    t = S('s03-money', '華東倉最會囤'); [put(thud(.35, 140 - 6 * i), t + i * .13) for i in range(9)]; put(ding(1175, .3, .3), t + .3)
    put(pop_(900, 500, .1, .4), S('s03-money', '像家裡什麼都捨不得丟', .1))
    # s04
    t = S('s04-turnover', '平均二十二點八天'); put(pop_(760, 360, .09, .45), t); [put(tick(.35, 1200), t + .4 + i * .42) for i in range(6)]
    put(pop_(760, 400, .1, .45), S('s04-turnover', '右上角')); put(ding(988, .25, .35), S('s04-turnover', '是空的'))
    # s05
    put(pop_(800, 400, .09, .4), S('s05-risk', '超過一百八十天')); put(pop_(760, 380, .09, .4), S('s05-risk', '已退市的')); put(pop_(720, 360, .09, .4), S('s05-risk', '快到期的只有'))
    t = S('s05-risk', '最資深的住戶'); put(ding(1318, .4, .5), t + .05)
    t = S('s05-risk', '一箱貨再多種罪名'); put(whoosh(.35, .5), t - .15); [put(pop_(850 - 80 * i, 450, .1, .5), t + .3 + i * .5) for i in range(3)]
    t = S('s05-risk', '也只算一次'); put(thud(1.0, 85), t + .16); put(tick(.8, 900), t + .17)
    # s06
    put(pop_(780, 380, .09, .4), S('s06-replenish', '缺貨率')); put(pop_(700, 340, .09, .4), S('s06-replenish', '百分之七點五', .1))
    t = S('s06-replenish', '批發客戶最沒耐心'); put(bwoop(.4, False), t + .1); [put(pop_(500, 300, .08, .22), t + .4 + i * .3) for i in range(3)]
    t = S('s06-replenish', '報表算出'); [put(pop_(700 + 80 * i, 420, .08, .35), t + i * .2) for i in range(3)]
    t = S('s06-replenish', '建議補貨八百一十四件'); [put(tick(.3, 900 + 60 * i), t - .8 + i * .12) for i in range(7)]; put(ding(1568, .55, .5), t + .05)
    # s07
    t = S('s07-transfer', '先問鄰居有沒有多的醬油'); [put(knock(.9), t + .0 + i * .18) for i in range(3)]; put(whoosh(.35, .45), t + 1.2); put(pop_(520, 300, .08, .5), t + 1.85)
    t = S('s07-transfer', '華北倉調出最多'); [put(whoosh(.3, .25), t + i * .3) for i in range(5)]; [put(tick(.3, 1100 + 20 * i), t + .05 * i + .1) for i in range(40)]
    t = S('s07-transfer', '庫存卻最少'); put(bwoop(.35, False), t + .1)
    t = S('s07-transfer', '還是被借光了'); put(pop_(760, 400, .09, .4), t)
    t = S('s07-transfer', '先問清楚'); put(thud(.5, 140), t + .2); put(whoosh(.2, .4), t + .08)
    # s08
    t = S('s08-count', '像點名只點有來的人'); [put(pop_(900 - 40 * i, 520, .08, .35), t + .0 + i * .35) for i in range(4)]
    put(pop_(780, 400, .09, .4), S('s08-count', '準確率九成三多')); put(pop_(780, 400, .09, .4), S('s08-count', '但只代表有盤到的記錄'))
    t = S('s08-count', '多了兩萬九'); put(pop_(780, 400, .09, .4), t); put(bwoop(.25, True), t + .2)
    t = S('s08-count', '幾乎抵銷'); put(ding(988, .3, .35), t + .3)
    t = S('s08-count', '可是絕對差異'); put(ding(740, .5, .6), t); put(bang(.4), t); t2 = S('s08-count', '可是絕對差異', 1.6); put(thud(.7, 90), t2 + .12)
    # s09
    t = S('s09-measure', '阿倉遞上計算機'); put(whoosh(.4, .5), t)
    t = S('s09-measure', '度量值'); put(tick(1.0, 700), t); put(ding(1175, .25, .3), t + .08)
    t = S('s09-measure', '就是存好公式的按鈕'); [put(tick(.5, 1500 + 30 * (i % 3)), t + .2 + i * .045) for i in range(20)]
    t = S('s09-measure', '一共九十三個'); [put(pop_(700 + 8 * i, 420, .05, .12), t + i * .012) for i in range(93)]; put(ding(1568, .45, .5), t + .2)
    # s10
    t = S('s10-decide', '老闆問最後一題'); put(thud(.3, 180), t + .5)
    put(pop_(780, 400, .09, .4), S('s10-decide', '總覽找重點')); put(pop_(780, 400, .09, .4), S('s10-decide', '專題頁查細節')); put(pop_(780, 400, .09, .4), S('s10-decide', '從查數字走向做判斷'))
    t = S('s10-decide', '從查數字走向做判斷', .9); put(ding(1568, .35, .6), t)
    t = S('s10-decide', '老闆拿起電話'); put(pop_(520, 300, .08, .4), t + .1)
    # 撥號音（350+440 Hz）與回鈴
    t = S('s10-decide', '老闆拿起電話', .6); n = int(.7 * SR); tt = np.arange(n) / SR; dial = (np.sin(2 * np.pi * 350 * tt) + np.sin(2 * np.pi * 440 * tt)) * .09 * np.minimum(tt / .01, 1) * np.minimum((.7 - tt) / .03, 1); put(dial, t, 1.0)
    t = S('s10-decide', '第一通打給華北倉', .3)
    for r in range(2):
        for k in range(2): n = int(.4 * SR); tt = np.arange(n) / SR; ring = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * .07 * np.minimum(tt / .01, 1) * np.minimum((.4 - tt) / .03, 1); put(ring, t + r * 1.2 + k * .5 - 0.0, 1.0)
    last = TL['scenes'][-1]; te = (last['voiceStartFrame'] + last['voiceFrames']) / FPS + .5
    [put(ding(f, .5, 1.1), te + i * .12) for i, f in enumerate([523, 659, 784, 1046])]
    return sfx

def write_wav(path, x):
    x = np.clip(x, -1, 1); a = (x * 32767).astype('<i2')
    with wave.open(path, 'w') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes())

if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
    music = make_music(); write_wav(os.path.join(ROOT, 'audio/music.wav'), music * 1.0)
    s = build_sfx(); p = np.percentile(np.abs(s), 99.8); s *= .19 / (p + 1e-9); s = np.tanh(s * 1.3) / 1.3   # 以 99.8 百分位歸一＋軟限幅，避免單一巨響拉高整體
    write_wav(os.path.join(ROOT, 'audio/sfx.wav'), s)
    print('music rms', round(float(np.sqrt(np.mean(music ** 2))), 4), 'sfx peak', round(float(np.max(np.abs(s))), 3), 'dur', round(DUR, 2))
