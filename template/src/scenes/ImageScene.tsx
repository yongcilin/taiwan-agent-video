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

// 情境插圖場景：顯示 codex Image 2 生成的圖（放在 public/images/），下方帶一句說明。
export const ImageScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18 } });
  const scale = interpolate(enter, [0, 1], [0.86, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const capOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #eaf3ff 0%, #f7fbff 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props.src ? (
        <div style={{ transform: `scale(${scale})`, opacity }}>
          <Img
            src={staticFile(props.src)}
            style={{ width: 760, borderRadius: 24 }}
          />
        </div>
      ) : null}
      {props.caption ? (
        <div
          style={{
            marginTop: 36,
            fontSize: 46,
            fontWeight: 700,
            color: "#1a4c8b",
            opacity: capOpacity,
          }}
        >
          {props.caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
