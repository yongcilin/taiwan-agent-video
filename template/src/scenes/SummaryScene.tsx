import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../font";
import type { SceneProps } from "../types";

export const SummaryScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15 } });
  const scale = interpolate(enter, [0, 1], [0.8, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #1a4c8b 0%, #2457d6 100%)",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          fontSize: 72,
          fontWeight: 900,
          color: "white",
          padding: "0 80px",
          lineHeight: 1.4,
        }}
      >
        {props.text}
      </div>
    </AbsoluteFill>
  );
};
