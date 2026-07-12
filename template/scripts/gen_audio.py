#!/usr/bin/env python3
"""
依 lesson.json 逐句用 Edge TTS 產生旁白語音，量測實際長度，
寫回 src/audio-manifest.json 讓 Remotion 自動排時間軸。

特色：
- 台灣語音（zh-TW-HsiaoChenNeural 等），免費、免帳號、跨平台（Mac/Win/Linux）
- 以 voice+text 雜湊快取：內容沒改就不重新合成，省時且結果可重現
- 用 mutagen 量 mp3 長度（純 Python，不需系統 ffprobe）
- 失敗自動重試（指數退避）

需求：pip install edge-tts mutagen
"""
import asyncio
import hashlib
import json
import math
import os
import sys

try:
    import edge_tts
except ImportError:
    sys.exit("缺少 edge-tts，請先跑： pip install edge-tts mutagen")

try:
    from mutagen.mp3 import MP3
except ImportError:
    sys.exit("缺少 mutagen，請先跑： pip install mutagen")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSON = os.path.join(ROOT, "lesson.json")
AUDIO_DIR = os.path.join(ROOT, "public", "audio")
MANIFEST = os.path.join(ROOT, "src", "audio-manifest.json")

TAIL_PADDING_SEC = 0.6  # 每段語音結束後多留一點呼吸空間


def sig(voice: str, text: str) -> str:
    return hashlib.sha256(f"{voice}\n{text}".encode("utf-8")).hexdigest()[:16]


async def synth(text: str, voice: str, out_path: str, retries: int = 4) -> None:
    delay = 1.0
    for attempt in range(1, retries + 1):
        try:
            comm = edge_tts.Communicate(text, voice)
            await comm.save(out_path)
            if os.path.getsize(out_path) > 0:
                return
            raise RuntimeError("產生的音檔為空")
        except Exception as e:  # noqa: BLE001
            if attempt == retries:
                raise
            print(f"  [重試 {attempt}/{retries}] {e}")
            await asyncio.sleep(delay)
            delay *= 2


async def main() -> None:
    with open(LESSON, encoding="utf-8") as f:
        lesson = json.load(f)

    fps = lesson["meta"]["fps"]
    default_voice = lesson["meta"].get("voice", "zh-TW-HsiaoChenNeural")
    os.makedirs(AUDIO_DIR, exist_ok=True)

    manifest = {}
    for scene in lesson["scenes"]:
        sid = scene["id"]
        text = (scene.get("narration") or "").strip()
        if not text:
            continue
        voice = scene.get("voice", default_voice)
        h = sig(voice, text)
        mp3_path = os.path.join(AUDIO_DIR, f"{sid}.mp3")
        hash_path = os.path.join(AUDIO_DIR, f"{sid}.hash")

        cached = (
            os.path.exists(mp3_path)
            and os.path.exists(hash_path)
            and open(hash_path, encoding="utf-8").read().strip() == h
        )
        if cached:
            print(f"[快取] {sid}")
        else:
            print(f"[合成] {sid} ({voice})")
            await synth(text, voice, mp3_path)
            with open(hash_path, "w", encoding="utf-8") as f:
                f.write(h)

        dur = MP3(mp3_path).info.length + TAIL_PADDING_SEC
        frames = int(math.ceil(dur * fps))
        manifest[sid] = {"audio": f"audio/{sid}.mp3", "durationInFrames": frames}

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"\n完成，已寫入 {MANIFEST}")


if __name__ == "__main__":
    asyncio.run(main())
