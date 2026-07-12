// lesson.json 的資料結構定義

export type SceneType = "title" | "image" | "stepCards" | "summary";

export interface StepItem {
  no: string;
  text: string;
  color: string;
}

export interface SceneProps {
  // title
  title?: string;
  subtitle?: string;
  // image
  src?: string;
  caption?: string;
  // stepCards
  heading?: string;
  steps?: StepItem[];
  // summary
  text?: string;
}

export interface Scene {
  id: string;
  type: SceneType;
  narration: string;
  durationInSeconds: number;
  props: SceneProps;
}

export interface LessonMeta {
  title: string;
  voice: string;
  fps: number;
  width: number;
  height: number;
}

export interface Lesson {
  meta: LessonMeta;
  scenes: Scene[];
}

// gen_audio.py 產生的 public/audio-manifest.json
export interface AudioEntry {
  audio: string; // 相對 public 的路徑，如 audio/title.mp3
  durationInFrames: number; // 依實際語音長度換算
}
export type AudioManifest = Record<string, AudioEntry>;
