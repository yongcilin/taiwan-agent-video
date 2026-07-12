import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../font";
import type { SceneProps } from "../types";

export const TitleScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16 } });
  const y = interpolate(enter, [0, 1], [-60, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const subEnter = spring({ frame: frame - 10, fps, config: { damping: 18 } });
  const subOpacity = interpolate(subEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #eaf3ff 0%, #f7fbff 100%)",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ transform: `translateY(${y}px)`, opacity }}>
        <div style={{ fontSize: 96, fontWeight: 900, color: "#1a4c8b" }}>
          {props.title}
        </div>
      </div>
      {props.subtitle ? (
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 600,
            color: "#5a7ba6",
            opacity: subOpacity,
          }}
        >
          {props.subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
