// lesson.json 的資料結構定義

export type SceneType = "title" | "image" | "stepCards" | "summary" | "video";

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
  // video（src、caption 與 image 共用）
  videoDurationInSeconds?: number; // 素材實際長度（video 場景必填，validate.ts 會檢查）；旁白比素材長時據此循環播放
}

export interface Scene {
  id: string;
  type: SceneType;
  narration: string;
  durationInSeconds: number;
  voice?: string; // 覆蓋 meta.voice，單場景換聲音（gen_audio.py 支援）
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
