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

// 情境插圖場景：上方一句重點標語（heading），中間顯示 codex Image 2 生成的圖。
// 注意：重點標語放「上方」，避免和底部的旁白字幕（Caption）重疊。
export const ImageScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const capEnter = spring({ frame, fps, config: { damping: 16 } });
  const capY = interpolate(capEnter, [0, 1], [-40, 0]);
  const capOpacity = interpolate(capEnter, [0, 1], [0, 1]);

  const imgEnter = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const scale = interpolate(imgEnter, [0, 1], [0.86, 1]);
  const imgOpacity = interpolate(imgEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        background: "linear-gradient(135deg, #eaf3ff 0%, #f7fbff 100%)",
      }}
    >
      {/* 上方重點標語 */}
      {props.caption ? (
        <div
          style={{
            position: "absolute",
            top: 70,
            width: "100%",
            textAlign: "center",
            transform: `translateY(${capY}px)`,
            opacity: capOpacity,
          }}
        >
          <span style={{ fontSize: 58, fontWeight: 900, color: "#1a4c8b" }}>
            {props.caption}
          </span>
        </div>
      ) : null}

      {/* 中間插圖（稍微上移，避開底部字幕） */}
      {props.src ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 60,
            paddingBottom: 180,
          }}
        >
          <div style={{ transform: `scale(${scale})`, opacity: imgOpacity }}>
            <Img
              src={staticFile(props.src)}
              style={{ width: 620, borderRadius: 24 }}
            />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
