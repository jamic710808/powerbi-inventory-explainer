# template + assets → 單檔 explainer.html（圖片以 base64 內嵌，單檔就能開）
# 嵌入 1920 寬（點開放大用）與 960 寬（縮圖用）兩種；影片與海報另放（film.mp4 / poster.jpg），同資料夾即可播放
import base64,json,sys
t=open('src/explainer.template.html',encoding='utf-8').read()
d={}
for i in range(8):
    for k in (f'p{i}',f'p{i}_s'):
        d[k]='data:image/jpeg;base64,'+base64.b64encode(open(f'assets/{k}.jpg','rb').read()).decode()
assert '/*IMGS*/{}' in t
t=t.replace('/*IMGS*/{}',json.dumps(d,ensure_ascii=False))
out=sys.argv[1] if len(sys.argv)>1 else 'explainer.html'
open(out,'w',encoding='utf-8').write(t)
print(round(len(t.encode('utf-8'))/1e6,2),'MB ->',out)
