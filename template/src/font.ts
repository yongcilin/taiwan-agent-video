// 中文字型：目前用 @remotion/google-fonts 的 Noto Sans TC（跨平台、免管理字型檔）。
// 進階優化（見 README 路線圖）：改成把 woff2 打包進 public/fonts，用 @remotion/fonts + staticFile
// 本地載入，可完全離線、渲染結果永久可重現。
import { loadFont } from "@remotion/google-fonts/NotoSansTC";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
});

export const FONT_FAMILY = fontFamily;
