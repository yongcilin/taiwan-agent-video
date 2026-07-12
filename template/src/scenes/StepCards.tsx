import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../font";
import type { SceneProps, StepItem } from "../types";

const Card: React.FC<{ index: number; item: StepItem }> = ({ index, item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 10 + index * 12;
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const x = interpolate(enter, [0, 1], [90, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateX(${x}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 28,
        width: "100%",
        boxSizing: "border-box",
        background: "white",
        borderRadius: 22,
        padding: "26px 40px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        borderLeft: `14px solid ${item.color}`,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: item.color,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 42,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {item.no}
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 600,
          color: "#2c3e50",
          whiteSpace: "nowrap",
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

export const StepCards: React.FC<{ props: SceneProps }> = ({ props }) => {
  const steps = props.steps ?? [];
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #eaf3ff 0%, #f7fbff 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props.heading ? (
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: "#1a4c8b",
            marginBottom: 50,
          }}
        >
          {props.heading}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          width: 900,
        }}
      >
        {steps.map((s, i) => (
          <Card key={s.no} index={i} item={s} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
