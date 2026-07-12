import type { Lesson, Scene } from "./types";

// lesson.json 的執行期驗證：TypeScript 的型別斷言擋不住 JSON 資料錯誤，
// 這裡在載入時一次檢查，錯誤訊息帶場景 id，直接 fail fast 勝過渲染出錯片。

// id 會當檔名（audio/<id>.mp3）與 React key，限制為跨平台安全字元。
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

const KNOWN_TYPES = new Set(["title", "image", "stepCards", "summary", "video"]);

const sceneErrors = (scene: Scene, index: number): string[] => {
  const errs: string[] = [];
  const tag = `scenes[${index}]（id: ${scene.id ?? "缺"}）`;

  if (!scene.id || !ID_RE.test(scene.id)) {
    errs.push(`${tag}：id 只能用英數、-、_，且以英數開頭`);
  }
  if (!KNOWN_TYPES.has(scene.type)) {
    errs.push(`${tag}：未知的 type「${scene.type}」`);
  }
  if (!(Number.isFinite(scene.durationInSeconds) && scene.durationInSeconds > 0)) {
    errs.push(`${tag}：durationInSeconds 必須是正數`);
  }

  const p = scene.props ?? {};
  switch (scene.type) {
    case "title":
      if (!p.title) errs.push(`${tag}：title 場景缺 props.title`);
      break;
    case "image":
      if (!p.src) errs.push(`${tag}：image 場景缺 props.src`);
      break;
    case "stepCards":
      if (!p.steps || p.steps.length === 0)
        errs.push(`${tag}：stepCards 場景缺 props.steps`);
      break;
    case "summary":
      if (!p.text) errs.push(`${tag}：summary 場景缺 props.text`);
      break;
    case "video":
      if (!p.src) errs.push(`${tag}：video 場景缺 props.src`);
      if (
        !(
          Number.isFinite(p.videoDurationInSeconds) &&
          (p.videoDurationInSeconds as number) > 0
        )
      ) {
        errs.push(
          `${tag}：video 場景必填 props.videoDurationInSeconds（正數，用 ffprobe 量素材長度）`,
        );
      }
      break;
    default:
      break;
  }
  return errs;
};

export const validateLesson = (lesson: Lesson): void => {
  const errs: string[] = [];

  const { meta, scenes } = lesson;
  if (!meta || !(meta.fps > 0) || !(meta.width > 0) || !(meta.height > 0)) {
    errs.push("meta 的 fps / width / height 必須是正數");
  }
  if (!scenes || scenes.length === 0) {
    errs.push("scenes 不可為空");
  } else {
    const seen = new Set<string>();
    scenes.forEach((s, i) => {
      errs.push(...sceneErrors(s, i));
      if (s.id) {
        if (seen.has(s.id)) errs.push(`scenes[${i}]：id「${s.id}」重複`);
        seen.add(s.id);
      }
    });
  }

  if (errs.length > 0) {
    throw new Error(`lesson.json 驗證失敗：\n- ${errs.join("\n- ")}`);
  }
};
