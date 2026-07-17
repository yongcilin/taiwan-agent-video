---
name: taiwan-agent-video
description: >-
  用資料驅動流程製作「台灣用語」短片——教學/講解、宣傳、活動預告、公告、成果回顧等皆可。當使用者說
  「做影片」「做教學影片」「做宣傳片」「用 Remotion 做影片」「把這個主題做成影片」「taiwan-agent-video」
  時觸發。以 lesson.json 為核心，codex Image 2 生圖、Remotion 排版動畫、Edge TTS 台灣語音配旁白，輸出 1080p MP4。
---

# 台灣用語短片製作 skill（taiwan-agent-video）

> **模板不在本 skill 目錄下**：`template/` 位於 clone 下來的 repo 內
> （通常是 `~/taiwan-agent-video/template/`；找不到時用 `find ~ -maxdepth 3 -name terms-zh-TW.yml` 定位）。
> 下文所有 `template/` 都指這個路徑。

這個 skill 幫使用者把一個主題，變成一支有動畫、插圖、台灣口音旁白的短片。
教學/講解影片是最常見的用途，但**宣傳片、活動預告、班級/學校公告、成果回顧、社群短片**用的是同一套流程，只差 lesson.json 的內容。
**核心原則：資料驅動**——你（agent）只需要產出 `lesson.json` 資料，不要每次重寫 Remotion 程式碼。
固定的元件庫會讀 JSON 自動渲染。

## 前置需求（第一次使用時確認）

- Node.js 18+（跑 Remotion）
- Python 3.8+，且已安裝 `edge-tts`、`mutagen`（`pip install -r scripts/requirements.txt`）
  - Windows 上 `python3` 可能不存在，改用 `py -3` 或 `python`
- 生圖需要本機有 codex CLI（`codex` 指令）且 `image_generation` feature 為啟用
  - 指定較新模型時若報「requires a newer version of Codex」，先 `npm install -g @openai/codex@latest` 升級再試
- 要用 `video` 場景時需要 ffmpeg／ffprobe（`ffmpeg -version` 確認）
- 專案相依：在 `template/` 底下跑過 `npm install`

## 標準工作流程

當使用者給你一個主題（例如「幫我做一支講『什麼是迴圈』的資訊課影片」）：

### 1. 寫腳本 → 產生 lesson.json
- 依主題規劃 4～8 個場景，每個場景挑一個 `type`：
  - `title`：開場標題卡（可選 `props.src` 滿版背景圖，會自動暗化壓字＋緩慢推進）
  - `image`：情境插圖 + 一句說明（滿版 cover + Ken Burns 慢速縮放位移，方向依圖片自動錯開）
  - `stepCards`：2～4 個步驟/重點卡片，依序彈跳滑入（鮮豔漸層背景）
  - `summary`：結尾金句（可選 `props.src` 滿版背景圖，暗化＋緩慢拉遠；`text` 支援 `\n` 換行）
  - `video`：實拍／AI 生成影片片段 + 一句說明（靜音播放，旁白照常由 TTS 提供）
- 宣傳片建議：開場與結尾共用同一張「場景全景圖」當背景，頭尾呼應、動態感最好。
- 背景音樂：`meta.bgm` 填相對 public 的路徑（如 `music/bgm.mp3`），`meta.bgmVolume` 預設 0.12；
  全片循環、頭尾自動淡入淡出。曲庫可用 incompetech（Kevin MacLeod，CC-BY 需附致謝文字，
  直接下載 `https://incompetech.com/music/royalty-free/mp3-royaltyfree/<曲名>.mp3`），交付時附授權說明。
- 底部字幕會自動把旁白依標點斷成 ≤20 字的短句、按字數比例輪播，單一子句不要寫超過 30 字，避免單行爆版。
- 每個場景寫：`narration`（旁白，口語、面向學生）、`durationInSeconds`（粗估，實際會被語音長度覆蓋）、`props`。
- 參考 `template/lesson.json` 的格式。

### 2. 台灣用語 QA（必做）
- 對照 `template/terms-zh-TW.yml`，把所有中國大陸用語替換成台灣用語
  （視頻→影片、算法→演算法、代碼→程式碼、默認→預設…）。
- 標點全形、面向國小：句子短、多比喻、少專有名詞。

### 3. 圖片素材（image 類場景）

**成果回顧／活動紀錄片優先用使用者的實拍照片，不要生圖**——真實照片比 AI 圖有說服力，
生圖留給沒有素材的教學/宣傳主題。照片流程：

- 照片多時先做**縮圖總表**再挑，不要一張張 Read（省 context）：用 Pillow 把每個資料夾拼成
  一張含檔名標籤的 contact sheet，一次看完整資料夾（Windows 通常沒有 ImageMagick，`montage` 不可用）。
- 挑圖標準：清晰、構圖好、主體置中。**直式照片會被滿版 cover 裁掉上下**，要挑主體在中央的。
- 複製到 `template/public/images/` 時**改用 ASCII 檔名**（如 `a-title.jpg`），避免中文路徑在
  Remotion/staticFile 出問題；一支影片一個前綴（`a-`、`b-`）方便多支共存。
- 開場 `title` 與結尾 `summary` 都吃 `props.src` 背景圖，挑兩張最有氣氛的寬景照頭尾呼應。
- 純資訊點（重點條列）穿插一個 `stepCards` 場景增加節奏變化，卡片 2～4 張（4 張會自動縮小避開字幕）。

**沒有實拍素材才走 codex 生圖**：
- 用 codex 生圖，**風格依使用者需求指定**（類皮克斯 3D、扁平向量、水彩⋯；使用者沒說就先問或預設扁平向量風）：
  ```
  codex exec --skip-git-repo-check --ephemeral "用內建生圖工具（gpt-image-2）產生一張 1536x1024 橫式插圖：<畫面描述>，<風格描述>。畫面中不要出現任何文字。生成後只回報圖片完整路徑，不要複製檔案。"
  ```
- **背景執行必須關 stdin**（Windows/PowerShell：`$null | codex exec ...`；bash：`codex exec ... < /dev/null`），
  否則 codex 停在「Reading additional input from stdin...」空轉直到逾時。
- **人物連貫鐵則**：多張圖有相同角色時，**必須用同一個 codex session 依序生成**，
  並在提示詞中明確要求「把前一張成品當參考圖輸入、角色外觀（髮型/服裝/書包顏色）與前張完全一致」；
  各自獨立的 session 看不到彼此的產出，角色必然飄移。無角色連貫需求的圖（如純場景全景）拆到並行 session 跑比較快。
- **實景對齊**：要貼近真實場地（校園、店面、活動現場）時，先讓 codex 用 `view_image` 看實拍照片再生圖，
  並在提示詞裡點名照片中的具體特徵（建築顏色、柱廊、招牌、地磚⋯），還原度會大幅提升。
  gpt-image-2 繁中少字幾乎全對，招牌/匾額上的短文字可以直接要求正確寫出。
- codex 會把圖存到 `~/.codex/generated_images/<session>/call_*.png` 或 `exec-*.png`（唯讀沙盒會擋複製，屬正常）。
- 你手動把該檔複製到 `template/public/images/<sceneId>.png`，並在 lesson.json 的 `props.src` 填 `images/<sceneId>.png`。
- **複製後自己 Read 每張圖檢查**：風格、有無多餘文字、角色一致性，不合格就讓 codex 重生該張。
- 沒有 codex 時的後援：可用 Pollinations 免費 API（`https://image.pollinations.ai/prompt/<prompt>?width=1280&height=720&model=flux&nologo=true`）下載成 png。

### 3b. 影片素材（video 類場景）
- 素材來源：使用者實拍（.MOV/.mp4）、或外包 Gemini 網頁版生 Veo 短片（agy/codex 目前都不能生影片，只能生圖）。
- **一律先轉 8-bit H.264 再用**（iPhone HDR 預設 10-bit，Remotion 與部分瀏覽器會出問題）。
  先建資料夾再轉，路徑一律加引號（中文／空白路徑）：
  ```bash
  mkdir -p template/public/videos
  ffmpeg -i "<來源檔>" -vf "scale=1280:-2,format=yuv420p" -c:v libx264 -profile:v high -crf 26 -preset slow -movflags +faststart -an "template/public/videos/<sceneId>.mp4"
  ```
  （Windows PowerShell：`mkdir` 改 `New-Item -ItemType Directory -Force`，其餘相同；若已在 `template/` 內，路徑去掉 `template/` 前綴）
- 量**轉檔後**素材的長度（秒），填進 `props.videoDurationInSeconds`（**必填**，validate 會擋）：
  ```bash
  ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "template/public/videos/<sceneId>.mp4"
  ```
- lesson.json 範例 props：`{ "src": "videos/<sceneId>.mp4", "caption": "一句重點", "videoDurationInSeconds": 11.3 }`
- 播放行為：影片靜音置中（上限 1200×700，直拍橫拍皆可），場景長度跟旁白走；旁白比素材長會自動從頭循環。

### 4. 生旁白語音 + 自動排時間軸
```
cd template && python3 scripts/gen_audio.py
```
- 會依 lesson.json 逐句用 Edge TTS 產生語音、量長度、寫回 `src/audio-manifest.json`。
- 之後每個場景的長度會自動用「實際語音長度」，不再靠估的秒數。
- **只要改過 lesson.json 的旁白就必須重跑這步**（有雜湊快取，沒改的場景不會重合成），
  否則會沿用舊語音與舊時間軸，渲染出內容對不上的影片。
- **一次做多支影片（多份 lesson 檔輪流 cp 成 lesson.json）時，每次切換後都要重跑**，
  否則 manifest 還是上一支的場景 id，新影片會整支沒旁白（只剩配樂/靜音）。

### 5. 渲染
```
cd template
npm run preview   # 720p 快速預覽
npm run render    # 1080p 正式母版 → out/lesson.mp4
```
- 想邊改邊看：`npm run studio` 開 Remotion Studio。

### 6. 交付前抽格 QA（必做）
- 渲染完不要只看檔案有生出來，用 ffmpeg 抽畫格自己 Read 檢查：
  ```bash
  ffmpeg -v error -ss <秒數> -i out/lesson.mp4 -frames:v 1 -y check.png
  ```
- **抽格要覆蓋到每一個場景**（用 audio-manifest 的 durationInFrames 累加算出各場景時間點，
  或均勻多抽幾格），只抽 2～4 格容易漏掉中間某個場景的問題。
- 多格用 Pillow 拼成一張總表再 Read，一次看完、省 context。
- 檢查重點：插圖有正確入片、字幕/標語沒有重疊出框、版面符合預期。抓到問題成本遠低於使用者看完回來反映。
- **聲音也要驗**：抽一小段量音量，確認旁白真的在（沒旁白＝忘了重跑 gen_audio 的典型症狀）：
  ```bash
  ffmpeg -ss 2 -t 1.5 -i out/lesson.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume
  # 有旁白約 -20 dB 上下；只剩配樂/靜音會掉到 -40 dB 以下
  ```

## 產出
- `template/out/lesson.mp4`（正式 1080p）
- 把成品**複製到使用者的專案資料夾**交付（連同該支影片的 lesson.json 備份，方便日後改版重渲）。
- 多支影片：lesson 檔取名 `lesson_A.json`、`lesson_B.json`⋯保留在 template/，
  輪流 `cp lesson_X.json lesson.json → gen_audio.py → render → 複製成品改名`；
  成品檔名用影片標題，交付資料夾同時放對應的 lesson_X.json。
- 有用配樂時，交付資料夾附一份配樂授權說明（曲名、作者、授權條款、需要的致謝文字）。

## 要新增場景型別時
- 才需要動程式碼：在 `template/src/scenes/` 新增元件、在 `types.ts` 加型別、在 `Root.tsx` 的 `renderScene` 註冊。
- 平常做影片不用碰這些，只改 lesson.json。

## 語音選擇（台灣）
- `zh-TW-HsiaoChenNeural`（曉臻，女，親切，預設）
- `zh-TW-HsiaoYuNeural`（曉雨，女）
- `zh-TW-YunJheNeural`（雲哲，男）
- 可在 lesson.json 的 `meta.voice` 或單一場景的 `voice` 覆蓋。
