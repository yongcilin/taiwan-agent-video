---
name: taiwan-teaching-video
description: >-
  用資料驅動流程製作「台灣用語」教學/講解影片（國小資訊課等）。當使用者說「做教學影片」「用
  Remotion 做影片」「把這個主題做成影片」「taiwan-teaching-video」時觸發。以 lesson.json 為核心，
  codex Image 2 生圖、Remotion 排版動畫、Edge TTS 台灣語音配旁白，輸出 1080p MP4。
---

# 台灣用語教學影片製作 skill

這個 skill 幫使用者把一個教學主題，變成一支有動畫、插圖、台灣口音旁白的教學影片。
**核心原則：資料驅動**——你（agent）只需要產出 `lesson.json` 資料，不要每次重寫 Remotion 程式碼。
固定的元件庫會讀 JSON 自動渲染。

## 前置需求（第一次使用時確認）

- Node.js 18+（跑 Remotion）
- Python 3.8+，且已安裝 `edge-tts`、`mutagen`（`pip install -r scripts/requirements.txt`）
- 生圖需要本機有 codex CLI（`codex` 指令）且 `image_generation` feature 為啟用
- 專案相依：在 `template/` 底下跑過 `npm install`

## 標準工作流程

當使用者給你一個主題（例如「幫我做一支講『什麼是迴圈』的資訊課影片」）：

### 1. 寫腳本 → 產生 lesson.json
- 依主題規劃 4～8 個場景，每個場景挑一個 `type`：
  - `title`：開場標題卡
  - `image`：情境插圖 + 一句說明（配 codex Image 2 生的圖）
  - `stepCards`：2～4 個步驟/重點卡片，依序滑入
  - `summary`：結尾金句
- 每個場景寫：`narration`（旁白，口語、面向學生）、`durationInSeconds`（粗估，實際會被語音長度覆蓋）、`props`。
- 參考 `template/lesson.json` 的格式。

### 2. 台灣用語 QA（必做）
- 對照 `template/terms-zh-TW.yml`，把所有中國大陸用語替換成台灣用語
  （視頻→影片、算法→演算法、代碼→程式碼、默認→預設…）。
- 標點全形、面向國小：句子短、多比喻、少專有名詞。

### 3. 生插圖（image 類場景）
- 對每個 `image` 場景，用 codex 生圖：
  ```
  codex exec --skip-git-repo-check --ephemeral "用內建生圖工具（gpt-image-2）產生：<畫面描述>，扁平向量風、明亮、白底、不要文字。生成後只回報圖片路徑，不要複製檔案。"
  ```
- codex 會把圖存到 `~/.codex/generated_images/<session>/call_*.png`（唯讀沙盒會擋複製，屬正常）。
- 你手動把該檔複製到 `template/public/images/<sceneId>.png`，並在 lesson.json 的 `props.src` 填 `images/<sceneId>.png`。
- 沒有 codex 時的後援：可用 Pollinations 免費 API（`https://image.pollinations.ai/prompt/<prompt>?width=1280&height=720&model=flux&nologo=true`）下載成 png。

### 4. 生旁白語音 + 自動排時間軸
```
cd template && python3 scripts/gen_audio.py
```
- 會依 lesson.json 逐句用 Edge TTS 產生語音、量長度、寫回 `src/audio-manifest.json`。
- 之後每個場景的長度會自動用「實際語音長度」，不再靠估的秒數。

### 5. 渲染
```
cd template
npm run preview   # 720p 快速預覽
npm run render    # 1080p 正式母版 → out/lesson.mp4
```
- 想邊改邊看：`npm run studio` 開 Remotion Studio。

## 產出
- `template/out/lesson.mp4`（正式 1080p）
- 把成品交給使用者。

## 要新增場景型別時
- 才需要動程式碼：在 `template/src/scenes/` 新增元件、在 `types.ts` 加型別、在 `Root.tsx` 的 `renderScene` 註冊。
- 平常做影片不用碰這些，只改 lesson.json。

## 語音選擇（台灣）
- `zh-TW-HsiaoChenNeural`（曉臻，女，親切，預設）
- `zh-TW-HsiaoYuNeural`（曉雨，女）
- `zh-TW-YunJheNeural`（雲哲，男）
- 可在 lesson.json 的 `meta.voice` 或單一場景的 `voice` 覆蓋。
