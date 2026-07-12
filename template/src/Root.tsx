import { Composition, Series, AbsoluteFill, Audio, staticFile } from "remotion";
import lessonData from "../lesson.json";
import audioManifest from "./audio-manifest.json";
import type { Lesson, Scene, AudioManifest } from "./types";
import { TitleScene } from "./scenes/TitleScene";
import { ImageScene } from "./scenes/ImageScene";
import { StepCards } from "./scenes/StepCards";
import { SummaryScene } from "./scenes/SummaryScene";
import { Caption } from "./scenes/Caption";

const lesson = lessonData as Lesson;
const manifest = audioManifest as AudioManifest;

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
    default:
      return <AbsoluteFill />;
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
