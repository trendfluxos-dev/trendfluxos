"""Voice Clone Studio — FastAPI VPS backend (single-voice mode)."""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
import os
import threading

from xtts_engine import generate_voice, warmup

app = FastAPI(title="Voice Clone Studio")

VOICE_DIR = "voices"
os.makedirs(VOICE_DIR, exist_ok=True)

# Single-flight lock prevents two concurrent /generate calls from saturating
# the model on a CPU-only VPS (XTTS is not safely re-entrant).
_GEN_LOCK = threading.Lock()


@app.on_event("startup")
def _startup_warmup() -> None:
    # Fire-and-forget warmup so the server can accept /health immediately.
    threading.Thread(target=warmup, daemon=True).start()


@app.get("/health")
def health():
    return {"status": "ok", "mode": "single-voice"}


@app.post("/warmup")
def trigger_warmup():
    ok = warmup()
    return {"warm": ok}


@app.post("/upload-voice")
async def upload_voice(file: UploadFile = File(...)):
    file_path = os.path.join(VOICE_DIR, "latest.wav")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    # Warm the model against the new sample so the first /generate is fast.
    threading.Thread(target=warmup, args=(file_path,), daemon=True).start()
    return {"status": "ok", "voice_path": file_path}


@app.post("/generate")
async def generate(text: str = Form(...), voice_path: str = Form(None)):
    if not voice_path:
        voice_path = os.path.join(VOICE_DIR, "latest.wav")
    if not os.path.exists(voice_path):
        return JSONResponse({"error": "No voice uploaded yet"}, status_code=400)
    # Serialize concurrent inference (CPU-bound, not re-entrant).
    with _GEN_LOCK:
        audio = generate_voice(text, voice_path)
    return FileResponse(audio, media_type="audio/wav")