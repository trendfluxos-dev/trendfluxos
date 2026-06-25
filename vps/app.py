"""Voice Clone Studio — FastAPI VPS backend (single-voice mode)."""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
import os

from xtts_engine import generate_voice

app = FastAPI(title="Voice Clone Studio")

VOICE_DIR = "voices"
os.makedirs(VOICE_DIR, exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok", "mode": "single-voice"}


@app.post("/upload-voice")
async def upload_voice(file: UploadFile = File(...)):
    file_path = os.path.join(VOICE_DIR, "latest.wav")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return {"status": "ok", "voice_path": file_path}


@app.post("/generate")
async def generate(text: str = Form(...), voice_path: str = Form(None)):
    if not voice_path:
        voice_path = os.path.join(VOICE_DIR, "latest.wav")
    if not os.path.exists(voice_path):
        return JSONResponse({"error": "No voice uploaded yet"}, status_code=400)
    audio = generate_voice(text, voice_path)
    return FileResponse(audio, media_type="audio/wav")