import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../font";
import type { SceneProps } from "../types";

// 結尾金句：可選 props.src 滿版背景圖（暗化 + 緩慢拉遠），金句彈跳進場後輕微呼吸。

export const SummaryScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const t = interpolate(frame, [0, durationInFrames], [0, 1]);
  const bgScale = interpolate(t, [0, 1], [1.2, 1.06]);
  const sceneFade = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const breathe = 1 + Math.sin(frame * 0.05) * 0.012;
  const scale = interpolate(enter, [0, 1], [0.7, 1]) * breathe;
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #1a4c8b 0%, #2457d6 100%)",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity: sceneFade,
        overflow: "hidden",
      }}
    >
      {props.src ? (
        <>
          <Img
            src={staticFile(props.src)}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${bgScale})`,
            }}
          />
          <AbsoluteFill style={{ background: "rgba(10,26,58,0.55)" }} />
        </>
      ) : null}

      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          fontSize: 76,
          fontWeight: 900,
          color: "white",
          padding: "0 90px",
          lineHeight: 1.5,
          textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          letterSpacing: 2,
          whiteSpace: "pre-line",
        }}
      >
        {props.text}
      </div>
    </AbsoluteFill>
  );
};
