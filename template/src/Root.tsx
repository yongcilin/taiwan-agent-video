import {
  Composition,
  Series,
  AbsoluteFill,
  Audio,
  staticFile,
  interpolate,
  useVideoConfig,
} from "remotion";
import lessonData from "../lesson.json";
import audioManifest from "./audio-manifest.json";
import type { Lesson, Scene, AudioManifest } from "./types";
import { TitleScene } from "./scenes/TitleScene";
import { ImageScene } from "./scenes/ImageScene";
import { StepCards } from "./scenes/StepCards";
import { SummaryScene } from "./scenes/SummaryScene";
import { VideoScene } from "./scenes/VideoScene";
import { Caption } from "./scenes/Caption";
import { validateLesson } from "./validate";

const lesson = lessonData as Lesson;
const manifest = audioManifest as AudioManifest;

// 載入即驗證：資料錯誤直接讓 Studio / render 明確報錯，不要渲染出錯片。
validateLesson(lesson);

const renderScene = (scene: Scene) => {
  switch (scene.type) {
    case "title":
      return <TitleScene props={scene.props} />;
    case "image":
      return <ImageScene props={scene.props} />;
    case "stepCards":
      return <StepCards props={scene.props} />;
    case "summary":
      return <SummaryScene props={scene.props} />;
    case "video":
      return <VideoScene props={scene.props} />;
    default:
      throw new Error(`場景「${scene.id}」的 type「${scene.type}」未註冊`);
  }
};

const sceneDuration = (scene: Scene, fps: number): number => {
  // 優先用實際語音長度（gen_audio.py 產生），否則用 lesson.json 宣告的秒數。
  const fromAudio = manifest[scene.id]?.durationInFrames;
  if (fromAudio && fromAudio > 0) return fromAudio;
  return Math.round(scene.durationInSeconds * fps);
};

// 背景音樂：全片低音量循環，開頭淡入、結尾淡出，不蓋過旁白。
const Bgm: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const { bgm, bgmVolume } = lesson.meta;
  if (!bgm) return null;
  const base = bgmVolume ?? 0.12;
  return (
    <Audio
      src={staticFile(bgm)}
      loop
      volume={(f) =>
        base *
        interpolate(
          f,
          [0, fps, durationInFrames - 2 * fps, durationInFrames - 1],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};

const LessonVideo: React.FC = () => {
  const { fps } = lesson.meta;
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <Bgm />
      <Series>
        {lesson.scenes.map((scene) => {
          const audio = manifest[scene.id]?.audio;
          return (
            <Series.Sequence
              key={scene.id}
              durationInFrames={sceneDuration(scene, fps)}
            >
              {renderScene(scene)}
              {audio ? <Audio src={staticFile(audio)} /> : null}
              <Caption text={scene.narration} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  const { fps, width, height } = lesson.meta;
  const total = lesson.scenes.reduce(
    (acc, s) => acc + sceneDuration(s, fps),
    0,
  );
  return (
    <Composition
      id="Lesson"
      component={LessonVideo}
      durationInFrames={total}
      fps={fps}
      width={width}
      height={height}
    />
  );
};
