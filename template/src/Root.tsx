import { Composition, Series, AbsoluteFill, Audio, staticFile } from "remotion";
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

const LessonVideo: React.FC = () => {
  const { fps } = lesson.meta;
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
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
