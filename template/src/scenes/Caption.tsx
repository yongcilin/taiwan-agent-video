import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../font";

// 底部字幕條：旁白依標點斷成短句，按字數比例分配時間、跟著旁白進度輪播，
// 每段控制在單行內。路線圖：改用 Edge TTS 的 word-boundary 時間戳做精準對齊（見 README）。

const MAX_CHARS = 20;

const splitIntoChunks = (text: string): string[] => {
  const parts = text
    .split(/(?<=[，。；！？])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let cur = "";
  const len = (s: string) => s.replace(/[，。；！？、]/g, "").length;
  for (const p of parts) {
    if (cur && len(cur + p) > MAX_CHARS) {
      chunks.push(cur);
      cur = p;
    } else {
      cur += p;
    }
  }
  if (cur) chunks.push(cur);
  // 顯示時去掉每段結尾的逗號句號，畫面較乾淨
  return chunks.map((c) => c.replace(/[，。；]$/, ""));
};

export const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!text) return null;

  const chunks = splitIntoChunks(text);
  const weights = chunks.map((c) => Math.max(c.length, 4));
  const total = weights.reduce((a, b) => a + b, 0);

  let acc = 0;
  const spans = weights.map((w) => {
    const start = (acc / total) * durationInFrames;
    acc += w;
    const end = (acc / total) * durationInFrames;
    return [start, end] as const;
  });

  let idx = spans.findIndex(([s, e]) => frame >= s && frame < e);
  if (idx === -1) idx = chunks.length - 1;
  const [start, end] = spans[idx];

  // 段落太短時淡入淡出的 input range 會非遞增而讓 interpolate 報錯，直接恆顯示
  const opacity =
    end - start < 26
      ? 1
      : interpolate(
          frame,
          [start + 2, start + 10, end - 8, end - 2],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          maxWidth: "90%",
          fontSize: 40,
          fontWeight: 500,
          color: "white",
          background: "rgba(0,0,0,0.66)",
          padding: "14px 34px",
          borderRadius: 16,
          lineHeight: 1.5,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {chunks[idx]}
      </div>
    </div>
  );
};
