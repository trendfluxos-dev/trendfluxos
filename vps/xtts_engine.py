"""XTTS-v2 inference wrapper (single-voice mode)."""
import os
import uuid
from TTS.api import TTS

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load once at import time.
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)


def generate_voice(text: str, voice_path: str, language: str = "bn") -> str:
    output_path = os.path.join(OUTPUT_DIR, f"voice_{uuid.uuid4().hex}.wav")
    tts.tts_to_file(
        text=text,
        speaker_wav=voice_path,
        language=language,
        file_path=output_path,
    )
    return output_path