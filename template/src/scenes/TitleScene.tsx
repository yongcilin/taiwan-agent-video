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

// 開場標題卡：可選 props.src 滿版背景圖（暗化 + 緩慢推進），
// 沒有背景圖時用動態漸層 + 漂浮光點。標題彈跳進場、副標上滑。

const DOTS = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 137) % 100,
  y: (i * 61) % 100,
  r: 14 + ((i * 53) % 46),
  speed: 0.35 + ((i * 29) % 10) / 18,
  phase: (i * 97) % 360,
}));

export const TitleScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const t = interpolate(frame, [0, durationInFrames], [0, 1]);
  const bgScale = interpolate(t, [0, 1], [1.05, 1.18]);
  const sceneFade = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const enter = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 110 },
  });
  const titleScale = interpolate(enter, [0, 1], [0.55, 1]);
  const titleOpacity = interpolate(enter, [0, 1], [0, 1]);

  const subEnter = spring({ frame: frame - 14, fps, config: { damping: 16 } });
  const subY = interpolate(subEnter, [0, 1], [46, 0]);
  const subOpacity = interpolate(subEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #2b6fd4 0%, #7dc4ff 55%, #ffd98a 100%)",
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
          <AbsoluteFill style={{ background: "rgba(12,28,60,0.46)" }} />
        </>
      ) : (
        // 無背景圖：漂浮光點增加動感
        DOTS.map((d, i) => {
          const float =
            Math.sin((frame * d.speed + d.phase) * (Math.PI / 90)) * 26;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${d.x}%`,
                top: `calc(${d.y}% + ${float}px)`,
                width: d.r,
                height: d.r,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.32)",
              }}
            />
          );
        })
      )}

      <div
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          padding: "0 100px",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: "white",
            lineHeight: 1.25,
            textShadow: "0 6px 34px rgba(0,0,0,0.45)",
            letterSpacing: 3,
          }}
        >
          {props.title}
        </div>
      </div>
      {props.subtitle ? (
        <div
          style={{
            marginTop: 34,
            transform: `translateY(${subY}px)`,
            opacity: subOpacity,
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 42,
              fontWeight: 700,
              color: "#123a6b",
              background: "rgba(255,255,255,0.92)",
              padding: "14px 44px",
              borderRadius: 999,
              boxShadow: "0 8px 30px rgba(0,0,0,0.28)",
            }}
          >
            {props.subtitle}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
