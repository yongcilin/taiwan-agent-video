import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../font";

// 底部字幕條：整段旁白顯示在畫面下方，進出場淡入淡出。
// 路線圖：改用 Edge TTS 的 word-boundary 時間戳做逐句/逐字對齊（見 README）。
export const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 場景太短時（< 30 frames）淡入淡出的 input range 會非遞增而讓 interpolate 報錯，
  // 直接恆顯示；一般長度才做進出場淡入淡出。
  const opacity =
    durationInFrames < 30
      ? 1
      : interpolate(
          frame,
          [4, 14, durationInFrames - 10, durationInFrames - 2],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  if (!text) return null;

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
          maxWidth: "80%",
          fontSize: 40,
          fontWeight: 500,
          color: "white",
          background: "rgba(0,0,0,0.66)",
          padding: "14px 34px",
          borderRadius: 16,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};
