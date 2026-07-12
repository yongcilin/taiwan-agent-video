import {
  AbsoluteFill,
  Loop,
  OffthreadVideo,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../font";
import type { SceneProps } from "../types";

// 實拍／生成影片場景：上方一句重點標語（caption），中間播放 mp4。
// - 影片一律靜音（旁白由 Edge TTS 提供）。
// - props.videoDurationInSeconds 必填（validate.ts 會擋）：一律以素材實際長度循環，
//   旁白比素材長就從頭重播、比素材短就播到旁白結束——不依賴 OffthreadVideo 的
//   EOF 尾端行為（那是未定義的，可能取幀失敗）。
// - 素材需為 8-bit H.264（iPhone HDR 來源請先轉檔：
//   ffmpeg -vf "scale=1280:-2,format=yuv420p" -profile:v high -c:v libx264 -crf 26 -an）
export const VideoScene: React.FC<{ props: SceneProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const capEnter = spring({ frame, fps, config: { damping: 16 } });
  const capY = interpolate(capEnter, [0, 1], [-40, 0]);
  const capOpacity = interpolate(capEnter, [0, 1], [0, 1]);

  const vidEnter = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const scale = interpolate(vidEnter, [0, 1], [0.9, 1]);
  const vidOpacity = interpolate(vidEnter, [0, 1], [0, 1]);

  // validate.ts 已擋掉缺欄位的 lesson；這裡再守一層是防有人繞過驗證直接用元件。
  if (!props.src || !props.videoDurationInSeconds) {
    throw new Error("VideoScene 需要 props.src 與 props.videoDurationInSeconds");
  }

  const video = (
    <OffthreadVideo
      src={staticFile(props.src)}
      muted
      style={{
        maxWidth: 1200,
        maxHeight: 700,
        borderRadius: 24,
      }}
    />
  );

  // 留 1 frame 安全邊界，避免循環尾端剛好落在素材 EOF 上取不到幀。
  const loopFrames = Math.max(
    1,
    Math.floor(props.videoDurationInSeconds * fps) - 1,
  );

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
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 58, fontWeight: 900, color: "#1a4c8b" }}>
            {props.caption}
          </span>
        </div>
      ) : null}

      {/* 中間影片（稍微上移，避開底部字幕） */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 60,
          paddingBottom: 180,
        }}
      >
        <div style={{ transform: `scale(${scale})`, opacity: vidOpacity }}>
          <Loop durationInFrames={loopFrames} layout="none">
            {video}
          </Loop>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
