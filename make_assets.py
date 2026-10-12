# shots/*.png（Desktop 橋接 3× 截圖）→ 裁掉視窗邊 → 左上角品牌圖標打馬賽克 → 輸出 hi/中/小 三種尺寸
# 為什麼在最大解析度就打碼：之後互動頁、影片、縮圖都從這批輸出取圖，任何一張都不會露出圖標
from PIL import Image
names=["首頁","庫存經營總覽","庫存結構與資金佔用","庫存週轉效率","庫齡、臨期與退市風險","缺貨預警與補貨決策","倉間平衡與調撥","盤點與庫存準確率"]
K=4454/1920                        # 裁切後寬度 ÷ 頁面邏輯寬度
LOGO=(14,44,226,110)               # 圖標在 1920×1080 頁面座標的範圍（含餘裕）
BLOCK=14                           # 馬賽克方塊（頁面座標 px）
def mosaic(im,box_page):
    x0,y0,x1,y1=[int(v*K) for v in box_page]; b=max(2,int(BLOCK*K))
    reg=im.crop((x0,y0,x1,y1)); w,h=reg.size
    small=reg.resize((max(1,w//b),max(1,h//b)),Image.BOX)
    im.paste(small.resize((w,h),Image.NEAREST),(x0,y0)); return im
for i,n in enumerate(names):
    im=Image.open(f"shots/{n}.png").convert("RGB").crop((0,42,4454,2544))
    if i>0: im=mosaic(im,LOGO)          # 首頁（封面）沒有這個圖標
    for suf,size,q in (("_hi",(3840,2160),90),("",(1920,1080),88),("_s",(960,540),82)):
        im.resize(size,Image.LANCZOS).save(f"assets/p{i}{suf}.jpg",quality=q)
    print(i,"ok")
