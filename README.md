# taiwan-agent-video

用 AI agent 自動化製作**台灣用語**短片的範本與 Claude Code skill。
**教學／講解影片、宣傳片、活動預告、公告、成果回顧、社群短片**都行——投影片動畫、情境插圖、台灣口音旁白，一句 prompt 產出 1080p MP4。差別只在 `lesson.json` 的內容，引擎相同。

跨平台：**macOS / Windows / Linux** 皆可。

## 這套怎麼運作（分層）

| 層 | 用什麼 | 說明 |
|---|---|---|
| 🧠 導演 | 語言模型（Claude / codex / Gemini） | 只產出 `lesson.json` 資料，**不每次重寫程式碼** |
| 🖼️ 生圖 | codex Image 2（gpt-image-2） | 生情境插圖；流程圖/圖表建議直接用向量畫 |
| 🎬 動畫 | Remotion（React 程式化影片） | 固定元件庫讀 `lesson.json` 渲染 |
| 🈶 字型 | Noto Sans TC | 解決 headless 中文豆腐問題 |
| 🎙️ 旁白 | Edge TTS 台灣語音 | 免費免帳號，曉臻／曉雨／雲哲 |
| 📤 輸出 | Remotion → MP4 | 1080p 母版 + 720p 預覽 |

**核心理念：資料驅動。** 做影片＝改 `lesson.json`，不用碰 React 程式碼。

## 安裝

```bash
git clone https://github.com/yongcilin/taiwan-agent-video.git
cd taiwan-agent-video/template
npm install
pip install -r scripts/requirements.txt   # edge-tts, mutagen
```

把 skill 交給 Claude Code：把 `skill/taiwan-agent-video/` 複製到你的 `~/.claude/skills/`。

前置：本機要有 `codex` CLI（生圖用）、Node 18+、Python 3.8+。

## 使用

### 手動
```bash
cd template
# 1. 編輯 lesson.json（場景、旁白、步驟）
# 2. 生插圖（見下）放到 public/images/，並在 lesson.json 填 props.src
# 3. 生旁白 + 自動排時間軸
python3 scripts/gen_audio.py
# 4. 渲染
npm run render        # 1080p → out/lesson.mp4
npm run preview       # 720p 快速預覽
npm run studio        # 開 Remotion Studio 邊改邊看
```

### 交給 Claude Code（推薦）
裝好 skill 後，直接說：
> 用 taiwan-agent-video 幫我做一支講「什麼是迴圈」的資訊課影片

agent 會照 skill 流程：寫 lesson.json → 台灣用語 QA → codex 生圖 → Edge TTS 配音 → 渲染。

## 生插圖（codex Image 2）

```bash
codex exec --skip-git-repo-check --ephemeral \
  "用內建生圖工具（gpt-image-2）產生：一個友善的卡通機器人指著流程圖，扁平向量風、明亮、白底、不要文字。生成後只回報圖片路徑，不要複製檔案。"
```
codex 會把圖存到 `~/.codex/generated_images/<session>/call_*.png`（唯讀沙盒會擋複製，屬正常），
手動複製到 `template/public/images/<sceneId>.png` 即可。

沒有 codex 時的後援：Pollinations 免費 API
`https://image.pollinations.ai/prompt/<描述>?width=1280&height=720&model=flux&nologo=true`

## lesson.json 場景型別

- `title`：開場標題卡
- `image`：情境插圖 + 一句說明
- `stepCards`：2～4 個步驟/重點卡片依序滑入
- `summary`：結尾金句
- `video`：實拍／AI 生成 mp4 片段 + 一句說明（靜音播放、旁白照常 TTS；
  素材先轉 8-bit H.264：`ffmpeg -vf "scale=1280:-2,format=yuv420p" -c:v libx264 -profile:v high -crf 26 -an`，
  放 `public/videos/`，`props.videoDurationInSeconds` 必填＝素材秒數，旁白較長時自動循環）

要新增型別才需動 `src/scenes/` 與 `src/Root.tsx`。
`lesson.json` 載入時會做執行期驗證（id 唯一且跨平台安全、各型別必填 props、正數時長），
資料錯誤會直接報錯而不是渲染出錯片。

## 台灣用語

`template/terms-zh-TW.yml` 是用語 QA 詞彙表，禁「視頻/算法/代碼/默認」等，強制台灣用語。
寫完 lesson.json 對照替換一次。

## 路線圖（三方技術檢視後的優化方向）

- [ ] 字型改本地打包 woff2（`@remotion/fonts` + `staticFile`），完全離線、渲染結果永久可重現
- [ ] 字幕改用 Edge TTS word-boundary 逐句/逐字精準對齊 + 輸出獨立 `.srt`
- [x] `video` 場景型別：嵌入實拍／AI 生成 mp4（2026-07-12，Clio）
- [ ] 更多場景型別：`flowDiagram`（Mermaid）、`codeWalkthrough`（Shiki 上色）、`quiz`
- [ ] 渲染參數 preset 化（CRF、yuv420p、fast-start）＋ `ffprobe` 自動驗證
- [ ] Edge TTS 斷線時自動切換 Azure Speech 備援介面

## 授權

MIT
