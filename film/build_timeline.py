# narration.json + vo/*.wav → timeline.json
# 場景長度 D = lead(全頁前導) + 0.5 + 旁白 + 0.7；場景首尾相接（不再疊 0.4s，避免雙重曝光）
import wave,json
N=json.load(open('narration.json',encoding='utf-8'))
LEAD={'s04':1.4,'s05':1.0,'s06':1.2,'s07':1.2,'s08':1.2,'s09':1.0,'s10':1.2}
TAIL={'s13':0.2}
sc=[];T=0.0
for n in N:
    w=wave.open(f"vo/{n['k']}.wav"); vo=w.getnframes()/w.getframerate(); lead=LEAD.get(n['k'],0.0)
    D=round(lead+0.5+vo+TAIL.get(n['k'],0.6),3)
    sc.append({"k":n['k'],"T":round(T,3),"D":D,"vo":round(vo,3),"lead":lead,"A":round(T+0.5+lead,3),"text":n['t']}); T+=D
    print(n['k'],round(vo,2),'D',D)
total=round(T,3)
json.dump({"fps":30,"total":total,"scenes":sc},open('timeline.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('total',total)
