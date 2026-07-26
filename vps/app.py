"""Voice Clone Studio — FastAPI VPS backend (single-voice mode).

Security: every endpoint except `/health` requires a bearer token that must
match the `XTTS_API_TOKEN` environment variable. The token is mandatory —
if it is unset, the protected endpoints fail closed (503) instead of
serving unauthenticated traffic. This keeps the founder-only authorization
enforced end-to-end even if someone reaches the VPS directly, bypassing the
Supabase edge-function proxy or the reverse proxy.
"""
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Header
from fastapi.responses import FileResponse, JSONResponse
import hmac
import os
import threading
from typing import Optional

from xtts_engine import generate_voice, warmup

app = FastAPI(title="Voice Clone Studio")

VOICE_DIR = "voices"
os.makedirs(VOICE_DIR, exist_ok=True)

# Single-flight lock prevents two concurrent /generate calls from saturating
# the model on a CPU-only VPS (XTTS is not safely re-entrant).
_GEN_LOCK = threading.Lock()


def require_token(authorization: Optional[str] = Header(default=None)) -> None:
    """Enforce a bearer token on every protected endpoint (fail closed)."""
    expected = os.environ.get("XTTS_API_TOKEN", "").strip()
    if not expected:
        raise HTTPException(
            status_code=503,
            detail="Server misconfigured: XTTS_API_TOKEN is not set.",
        )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    presented = authorization.split(" ", 1)[1].strip()
    if not hmac.compare_digest(presented, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.on_event("startup")
def _startup_warmup() -> None:
    if not os.environ.get("XTTS_API_TOKEN", "").strip():
        print("[voice-clone] WARNING: XTTS_API_TOKEN is unset — protected endpoints will return 503.")
    # Fire-and-forget warmup so the server can accept /health immediately.
    threading.Thread(target=warmup, daemon=True).start()


@app.get("/health")
def health():
    """Unauthenticated liveness probe — exposes no voice data."""
    return {"status": "ok", "mode": "single-voice"}


@app.post("/warmup", dependencies=[Depends(require_token)])
def trigger_warmup():
    ok = warmup()
    return {"warm": ok}


@app.post("/upload-voice", dependencies=[Depends(require_token)])
async def upload_voice(file: UploadFile = File(...)):
    file_path = os.path.join(VOICE_DIR, "latest.wav")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    # Warm the model against the new sample so the first /generate is fast.
    threading.Thread(target=warmup, args=(file_path,), daemon=True).start()
    return {"status": "ok", "voice_path": file_path}


@app.post("/generate", dependencies=[Depends(require_token)])
async def generate(text: str = Form(...), voice_path: str = Form(None)):
    text = (text or "").strip()
    if not text:
        return JSONResponse({"error": "text is required"}, status_code=400)
    if len(text) > 5000:
        return JSONResponse({"error": "text too long (max 5000 chars)"}, status_code=400)
    if voice_path:
        # Never let a caller read arbitrary paths off the box.
        safe_root = os.path.realpath(VOICE_DIR)
        resolved = os.path.realpath(voice_path)
        if os.path.commonpath([safe_root, resolved]) != safe_root:
            return JSONResponse({"error": "invalid voice_path"}, status_code=400)
        voice_path = resolved
    else:
        voice_path = os.path.join(VOICE_DIR, "latest.wav")
    if not os.path.exists(voice_path):
        return JSONResponse({"error": "No voice uploaded yet"}, status_code=400)
    # Serialize concurrent inference (CPU-bound, not re-entrant).
    with _GEN_LOCK:
        audio = generate_voice(text, voice_path)
    return FileResponse(audio, media_type="audio/wav")
