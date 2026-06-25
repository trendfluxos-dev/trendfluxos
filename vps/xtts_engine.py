"""XTTS-v2 inference wrapper (single-voice mode)."""
import os
import uuid
from TTS.api import TTS

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load once at import time.
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)

# Warmup pass — eliminates cold-start latency on the first real request.
# Tiny synth, discarded. Safe to fail (e.g. no voice file yet).
_WARMUP_DONE = False


def warmup(sample_voice: str = "voices/latest.wav") -> bool:
    global _WARMUP_DONE
    if _WARMUP_DONE:
        return True
    if not os.path.exists(sample_voice):
        return False
    try:
        tmp = os.path.join(OUTPUT_DIR, "_warmup.wav")
        tts.tts_to_file(text="ok", speaker_wav=sample_voice, language="en", file_path=tmp)
        _WARMUP_DONE = True
        return True
    except Exception:
        return False


def generate_voice(text: str, voice_path: str, language: str = "bn") -> str:
    output_path = os.path.join(OUTPUT_DIR, f"voice_{uuid.uuid4().hex}.wav")
    tts.tts_to_file(
        text=text,
        speaker_wav=voice_path,
        language=language,
        file_path=output_path,
    )
    return output_path