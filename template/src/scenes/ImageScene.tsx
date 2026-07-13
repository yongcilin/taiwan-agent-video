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

// 情境插圖場景：滿版 cover 圖片 + Ken Burns 慢速縮放位移，上方漸層壓重點標語。
// Ken Burns 方向依 src 字串雜湊決定，同一支影片中各場景自然錯開。

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
};

export const ImageScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const variant = hashStr(props.src ?? "") % 4;
  const t = interpolate(frame, [0, durationInFrames], [0, 1]);

  // 四種 Ken Burns 路徑：放大/縮小 × 左移/右移
  const zoomIn = variant % 2 === 0;
  const scale = zoomIn
    ? interpolate(t, [0, 1], [1.06, 1.22])
    : interpolate(t, [0, 1], [1.22, 1.06]);
  const panDir = variant < 2 ? 1 : -1;
  const panX = interpolate(t, [0, 1], [-24 * panDir, 24 * panDir]);
  const panY = interpolate(t, [0, 1], [10 * panDir, -10 * panDir]);

  // 整景快速淡入，柔化場景切換
  const sceneFade = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const capEnter = spring({ frame: frame - 5, fps, config: { damping: 15 } });
  const capX = interpolate(capEnter, [0, 1], [-70, 0]);
  const capOpacity = interpolate(capEnter, [0, 1], [0, 1]);
  const barGrow = spring({ frame: frame - 12, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill
      style={{ fontFamily: FONT_FAMILY, background: "#000", opacity: sceneFade }}
    >
      {props.src ? (
        <Img
          src={staticFile(props.src)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
          }}
        />
      ) : null}

      {/* 上下漸層：上方壓標語、下方壓旁白字幕 */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,20,40,0.62) 0%, rgba(10,20,40,0) 30%, rgba(10,20,40,0) 62%, rgba(10,20,40,0.66) 100%)",
        }}
      />

      {props.caption ? (
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 90,
            transform: `translateX(${capX}px)`,
            opacity: capOpacity,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "white",
              textShadow: "0 4px 24px rgba(0,0,0,0.55)",
              letterSpacing: 2,
            }}
          >
            {props.caption}
          </div>
          <div
            style={{
              marginTop: 18,
              height: 12,
              width: 340,
              borderRadius: 6,
              background: "linear-gradient(90deg, #ffb347, #ff5e7e)",
              transform: `scaleX(${barGrow})`,
              transformOrigin: "left",
              boxShadow: "0 2px 14px rgba(255,94,126,0.6)",
            }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
