# Power BI 庫存分析報告・圖解導覽

給「完全不懂 Power BI、也不熟庫存管理」的人看的導覽包：一支 5 分鐘介紹影片，加一個可以點、可以放大的互動圖解頁，講解一份 Power BI 庫存分析報告（8 張頁面、回答 6 個庫存管理問題）。

| | |
|---|---|
| 互動圖解頁（GitHub Pages） | https://jamic710808.github.io/powerbi-inventory-explainer/ |
| 互動圖解頁（Vercel） | https://powerbi-inventory-explainer.vercel.app |
| 影片 | 互動頁第 2 區（296 秒，1920×1080／30 fps，繁中旁白＋字幕） |

## 這個倉庫有什麼

```
docs/                 # 發佈用：index.html（單檔，圖片 base64 內嵌）、film.mp4、poster.jpg → GitHub Pages 從這裡發佈
assets/               # 報表 8 頁截圖（已把左上角品牌圖標打馬賽克）：p{n}_hi.jpg 3840、p{n}.jpg 1920、p{n}_s.jpg 960
src/explainer.template.html   # 互動頁模板
build_explainer.py    # 模板 + assets → 單檔 HTML
make_assets.py        # Desktop 截圖 → 裁切、打馬賽克、輸出三種尺寸（需要原始截圖，見下方說明）
film/
  narration.json      # 旁白稿（14 個場景）
  stage.html          # 影片畫面：render(t) 是「時間的純函式」，任意時刻都能重現同一格
  render.js           # 逐格渲染（puppeteer）→ ffmpeg
  gen_tts.py          # 逐場景呼叫 Gemini TTS（Kore）
  prep_audio.py       # 修頭尾靜音 + 重新取樣到 44.1 kHz
  build_timeline.py   # 依旁白長度排出時間軸 timeline.json
  mkaudio.py          # 程式合成配樂（柔和鋼琴＋pad，72 BPM）與轉場音效、混音
  BRIEF.md            # 事實清單與「不可宣稱」清單
  GAUNTLET.md         # 每一輪獨立評審與修正的紀錄
  CRITIC_1.md / CRITIC_2.md   # 兩輪評審原文
```

## 內容概要

- **8 頁**：封面、第 1 頁庫存經營總覽，加 6 張專題頁（結構與資金佔用、週轉效率、庫齡臨期與退市風險、缺貨預警與補貨決策、倉間平衡與調撥、盤點與庫存準確率）。
- **6 個問題**：錢壓在哪？轉得快不快？哪些貨有風險？要不要補貨？別的倉有沒有餘貨？帳和實物對不對得上？
- **模型**：20 張可見表（7 張事實表、9 張維度表、補貨策略與輔助表、度量值表）、93 個度量值、43 條業務關聯（另有 18 條自動日期表關聯）。
- **互動頁**：三層樓、六個問題、一筆數字的旅程、可點的星狀模型、8 頁熱點導覽、口徑翻面卡、圖表怎麼選、度量值分布、小字典、注意事項。

## 重新產生

需求：Python 3（`numpy`、`Pillow`）、Node.js ＋ `puppeteer-core`、Chrome 或 Edge、`ffmpeg`；旁白需要可用的 Gemini TTS 腳本（`gen_tts.py` 內寫的是作者本機路徑，請改成你自己的）。

```bash
# 1. 互動頁（只需要 assets/）
python build_explainer.py docs/index.html

# 2. 影片
cd film
python gen_tts.py            # 旁白 → audio/*.wav（需 Gemini TTS；已存在的場景會略過）
python prep_audio.py         # → vo/、vo44/
python build_timeline.py     # → timeline.json
python mkaudio.py            # → mix_raw.wav、music_only.wav
ffmpeg -y -i mix_raw.wav -af "loudnorm=I=-16:TP=-2.0:LRA=11" -ar 44100 mix.wav
node render.js . 0 296.099 out.mp4          # 逐格渲染（約 15 分鐘）
node render.js . --stills 12,60,140 qa      # 只輸出幾張 JPG 做檢查
```

> `make_assets.py` 需要用 Power BI Desktop 橋接工具（`powerbi-desktop screenshot-all --scale 3`）取得的原始截圖。原始截圖含有未打碼的報表品牌圖標，所以沒有放進倉庫；`assets/` 內是已處理好的版本。

## 事實與限制

- 資料為示範（模擬）資料（商品表的成本欄位就叫「模擬標準單位成本」），不代表任何真實公司。
- 數字取自報表畫面，並用 DAX 查詢對本機模型驗證過（首頁四個數字、期間天數、各表筆數、度量值分布、關聯數）。詳見 [film/BRIEF.md](film/BRIEF.md)。
- 報表本身有一處小不一致：盤點準確率卡片顯示 93.6%，同期間直接查詢為 93.55%（四捨五入 93.5%），同頁文字寫 93.5%。原因未查；影片旁白改說「九成三多」。
- 「每天約 2.93 萬出庫成本」是用報表數字推算的（1,779.3 萬 ÷ 608 天），不是報表上的數字。
- 畫面取自 Power BI Desktop 當下狀態（擷取時顯示有未儲存變更）。
- 旁白發音沒有逐句人工聆聽確認。
- 影片「近乎靜止」的畫面約 68%：這是講解片的讀圖時間，鏡頭只做緩慢推近與平移。

## 踩過的坑

旁白（Gemini TTS 輸出 24 kHz）一度沒重新取樣就貼進 44.1 kHz 的混音時間軸，聲音被加快約 1.84 倍、音調變高，兩輪評審與響度量測都沒發現。現在 `prep_audio.py` 會產生 44.1 kHz 版本，`mkaudio.py` 也加了取樣率斷言。經過與修正見 [film/GAUNTLET.md](film/GAUNTLET.md) 第 3 輪。

## 來源

- 報表：PowerBI星球《Power BI 庫存分析報告》（報表左上角的品牌圖標在本倉庫的圖片與影片中已打馬賽克）。
- 介紹文章：〈从周转到补货，这套 PowerBI 库存分析报告值得拆解〉（微信公眾號，簡體中文；本倉庫引用處已轉為繁體）。
- 本倉庫為學習用圖解導覽，非原作者製作。
