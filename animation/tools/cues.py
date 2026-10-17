# 由真實旁白音檔偵測停頓，對應到台詞標點，產生 cues.json（場景內各句的起訖秒數，相對旁白開始）。
# 為什麼：pipeline 內建字幕是「依字數近似」，笑點要踩準旁白，所以用音檔的實際停頓校準。
# 對不上時（停頓數 ≠ 標點數）退回以「字數＋標點權重」估計，並在輸出中標 method，方便檢查。
import json, re, subprocess, os, sys
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
film = json.load(open(os.path.join(ROOT, 'film.json'), encoding='utf-8'))
PUNCT = '，。！？：；、—'
def split_clauses(text):
    # 以「，。！？：；」切句（頓號與破折號不切）；保留引號
    parts, buf = [], ''
    for ch in text:
        buf += ch
        if ch in '，。！？：；': parts.append(buf); buf = ''
    if buf: parts.append(buf)
    # 引號尾端：「…？」這種把收尾引號併回前一句
    out = []
    for p in parts:
        if out and re.fullmatch(r'[」』]+', p.strip()): out[-1] += p
        else: out.append(p)
    return out
def duration(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode())
def gaps(p, noise='-36dB', d=0.14):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', f'silencedetect=noise={noise}:d={d}', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8')
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r.stderr)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r.stderr)]
    return [(s, e) for s, e in zip(starts, ends)]
res = {}
for s in film['scenes']:
    sid = s['id']; text = s['narration'].strip(); wav = os.path.join(ROOT, 'audio', sid + '.wav')
    D = duration(wav); clauses = split_clauses(text)
    need = len(clauses) - 1
    # 字數＋標點權重的估計邊界
    w = [len(re.sub(r'[」』「『]', '', c)) + (2.0 if c[-1] in '，；：' else 3.0 if c[-1] in '。？！' else 0) for c in clauses]
    tot = sum(w); est = []; acc = 0
    for x in w[:-1]: acc += x; est.append(acc / tot * D)
    method = 'estimate'
    bounds = est[:]
    g = []
    for noise, dmin in (('-36dB', .14), ('-34dB', .12), ('-32dB', .10), ('-30dB', .09), ('-28dB', .08), ('-26dB', .07)):
        g = [(x, y) for x, y in gaps(wav, noise, dmin) if x > 0.2 and y < D - 0.05]
        if len(g) < need or need == 0: continue
        used = set(); chosen = []
        for e in est:
            cand = [i for i in range(len(g)) if i not in used]
            if not cand: break
            best = min(cand, key=lambda i: abs((g[i][0] + g[i][1]) / 2 - e)); used.add(best); chosen.append(best)
        if len(chosen) == need and chosen == sorted(chosen) and all(abs((g[i][0] + g[i][1]) / 2 - e) < 1.4 for i, e in zip(chosen, est)):
            bounds = [(g[i][0] + g[i][1]) / 2 for i in chosen]; method = f'silence-matched({noise},{dmin})'; break
    if False:
        # 在偵測到的停頓中，為每個估計邊界選最近的一個（不重複），中點當邊界
        used = set(); chosen = []
        for e in est:
            best = min((i for i in range(len(g)) if i not in used), key=lambda i: abs((g[i][0] + g[i][1]) / 2 - e))
            used.add(best); chosen.append(best)
        if all(abs((g[i][0] + g[i][1]) / 2 - e) < 1.6 for i, e in zip(chosen, est)) and chosen == sorted(chosen):
            bounds = [(g[i][0] + g[i][1]) / 2 for i in chosen]; method = 'silence-matched'
    edges = [0.0] + bounds + [D]
    segs = []
    for i, c in enumerate(clauses):
        segs.append({'text': c.strip(), 'start': round(edges[i], 3), 'end': round(edges[i + 1], 3)})
    res[sid] = {'voiceSeconds': round(D, 3), 'method': method, 'gapsFound': len(g), 'clauses': len(clauses), 'segments': segs}
    print(sid, method, f'gaps={len(g)} clauses={len(clauses)}')
json.dump(res, open(os.path.join(ROOT, 'cues.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
