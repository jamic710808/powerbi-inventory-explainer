# 《阿倉的週一》——Power BI 庫存分析報告動畫

一支約 2 分 38 秒的橫屏動畫（1920×1080、30 fps），面向成年人，溫暖幽默：倉管阿倉用一份八頁的 Power BI 庫存報表，回答老闆的六個問題。畫風為「扁平插畫＋MG 動效」，旁白為 Gemini 3.8 Flash TTS 的 **Kore（溫和女聲）**，配樂與音效為原創程式合成。

## 交付物
- `final.mp4`：成片（H.264 / AAC）
- `script.md`（腳本 v2）、`storyboard.md`、`brief.md`、`style-options.md`、`style-choice.md`
- 前端工程：`index.html`、`runtime.js`、`lib.js`、`scenes.js`、`scenes1.js`～`scenes3.js`
- 時間軸與聲音：`film.json`、`timeline.json`、`cues.json`、`audio/`
- 檢查報告：`render-report.json`、`media-info.json`、`delivery-check.json`、`review.md`

## 重新產生
需求：Node.js、Python 3、FFmpeg、Playwright（以 `PLAYWRIGHT_MODULE` 指向現有模組，或在此資料夾 `npm i playwright`）、Chrome（`CHROME_PATH`）。旁白需要 Gemini TTS 腳本（`tools/tts_kore.py` 內預設的是作者本機路徑，可用環境變數 `GEMINI_TTS_SCRIPT` 覆蓋）。

```bash
export PLAYWRIGHT_MODULE=<playwright 模組路徑> CHROME_PATH=<chrome 路徑> PYTHON=python
python tools/tts_kore.py                 # 旁白（Kore）→ audio/<id>.wav ＋ 登記檔
python tools/pipeline.py timeline . --lock
python tools/cues.py                     # 以真實停頓校準每句旁白時間 → cues.json（字幕與動作用）
python tools/make_audio.py               # 配樂＋音效 → audio/music.wav、audio/sfx.wav
python tools/pipeline.py timeline . --lock
python tools/pipeline.py mix .
node tools/render.cjs . --preview        # 邊界與代表影格＋同格亂序重畫一致性檢查
node tools/render.cjs . --render         # 逐格渲染 → silent.mp4
python tools/pipeline.py finish .        # 合成 final.mp4 並完整解碼檢查
```

> 第一次從零開始時，`film.json` 的 `audioTracks` 指向尚未產生的檔案，`--lock` 會報錯；先暫時清空 `audioTracks`，產生音訊後再填回。

快速看單格：`node tools/shot.cjs . s02-calendar@19.2`（輸出在 `dev/`，不是交付物）。

## 做法備註
- 每一格都由 `renderFrame(frame)` 決定，不累計時間、不使用真實時鐘；人物是 2 段 IK 手臂的骨架，粒子與緩動都是時間的純函式。
- 字幕與動作對點：`tools/cues.py` 偵測旁白音檔的停頓並對應到標點，取代 pipeline 預設的「依字數近似」；場景程式以「片語」查句子起訖時間。
- 旁白取樣率：Gemini TTS 輸出 24 kHz，`tts_kore.py` 一律轉成 48 kHz 單聲道再登記；混音由 pipeline 的 `aresample` 處理。上一支影片曾因取樣率不符讓聲音加快，這裡以「旁白窗口 vs 旁白前後能量」逐場檢查。
- 內容事實與限制見 `script.md` 的「事實與限制」。人物與情節為虛構，數字取自示範資料；圖表是示意重畫，不是報表截圖。
