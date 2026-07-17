import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../font";
import type { SceneProps, StepItem } from "../types";

// 重點卡片場景：鮮豔漸層背景 + 漂浮圓點，卡片彈跳滑入、號碼圓呼吸放大。

const BG_DOTS = Array.from({ length: 10 }, (_, i) => ({
  x: (i * 149) % 100,
  y: (i * 83) % 100,
  r: 60 + ((i * 71) % 160),
  speed: 0.22 + ((i * 37) % 10) / 26,
  phase: (i * 113) % 360,
}));

const Card: React.FC<{ index: number; item: StepItem; compact: boolean }> = ({
  index,
  item,
  compact,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 8 + index * 11;
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 130 },
  });
  const x = interpolate(enter, [0, 1], [140, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const tilt = interpolate(enter, [0, 1], [3.5, 0]);
  // 號碼圓緩慢呼吸
  const pulse = 1 + Math.sin((frame - delay) * 0.09) * 0.05;

  return (
    <div
      style={{
        transform: `translateX(${x}px) rotate(${tilt}deg)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 30,
        width: "100%",
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.96)",
        borderRadius: 26,
        padding: compact ? "20px 40px" : "30px 44px",
        boxShadow: "0 16px 44px rgba(10,30,70,0.32)",
        borderLeft: `16px solid ${item.color}`,
      }}
    >
      <div
        style={{
          width: compact ? 72 : 84,
          height: compact ? 72 : 84,
          borderRadius: "50%",
          background: item.color,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 46,
          fontWeight: 900,
          flexShrink: 0,
          transform: `scale(${pulse})`,
          boxShadow: `0 6px 20px ${item.color}88`,
        }}
      >
        {item.no}
      </div>
      <div
        style={{
          fontSize: compact ? 48 : 54,
          fontWeight: 700,
          color: "#1c2f4a",
          whiteSpace: "nowrap",
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

export const StepCards: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = props.steps ?? [];
  // 4 張以上卡片時整體縮小，避免最下方卡片被底部字幕遮住
  const compact = steps.length >= 4;

  const sceneFade = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const headEnter = spring({ frame, fps, config: { damping: 13 } });
  const headY = interpolate(headEnter, [0, 1], [-56, 0]);
  const headOpacity = interpolate(headEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(140deg, #3a7bd5 0%, #5aa8e8 45%, #86c9f5 100%)",
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneFade,
        overflow: "hidden",
      }}
    >
      {BG_DOTS.map((d, i) => {
        const float =
          Math.sin((frame * d.speed + d.phase) * (Math.PI / 90)) * 30;
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
              background: "rgba(255,255,255,0.10)",
            }}
          />
        );
      })}

      {props.heading ? (
        <div
          style={{
            transform: `translateY(${headY}px)`,
            opacity: headOpacity,
            marginBottom: compact ? 36 : 52,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "white",
              textShadow: "0 4px 22px rgba(0,0,0,0.35)",
              letterSpacing: 4,
            }}
          >
            {props.heading}
          </div>
          <div
            style={{
              margin: "16px auto 0",
              height: 10,
              width: 220,
              borderRadius: 5,
              background: "linear-gradient(90deg, #ffd66b, #ff8a5c)",
            }}
          />
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 22 : 34,
          width: 980,
          paddingBottom: compact ? 120 : 0,
        }}
      >
        {steps.map((s, i) => (
          <Card key={s.no} index={i} item={s} compact={compact} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
