# 開發用：把 dev/ 內指定前綴的截圖拼成聯絡表。python tools/sheet.py s01 out.png [cols]
import sys,glob,os,re
from PIL import Image,ImageDraw
pre=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 3
fs=sorted(glob.glob(f'dev/{pre}*_t*.png'),key=lambda f:float(re.search(r'_t([\d.]+)\.png',f).group(1)))
w,h=800,450; rows=(len(fs)+cols-1)//cols; S=Image.new('RGB',(cols*w,rows*h),'#222')
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((w,h)); d=ImageDraw.Draw(im); d.rectangle((0,0,150,26),fill='#000'); d.text((6,6),os.path.basename(f)[:-4],fill='yellow'); S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(out); print(len(fs))
