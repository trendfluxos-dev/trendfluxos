# Voice Clone Studio — VPS (One-Prompt Publish)

Stable single-voice XTTS-v2 backend. Pairs with TrendFlux `/voice-clone` + `xtts-proxy` edge function.

## One-command deploy

```bash
cd vps
bash deploy.sh
```

What it does:
1. Installs system + Python deps
2. Creates venv, installs `requirements.txt`
3. Creates `voices/` and `outputs/`
4. Boots `uvicorn app:app` on `:8000` (background, logs → `server.log`)
5. Waits for `/docs` health check (XTTS first-run model download = 2–5 min)
6. Prints LIVE status + URL to paste into `XTTS_ENDPOINT_URL`

## Wire to TrendFlux

Add secrets in Lovable:
- `XTTS_ENDPOINT_URL` = `http://<your-vps-ip>:8000` (or HTTPS domain)
- `XTTS_API_TOKEN` *(optional)* = bearer token (also enforce in your reverse proxy)

The `xtts-proxy` edge function will route requests immediately — no code change.

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/upload-voice` | multipart `file` | `{ voice_path }` (overwrites `voices/latest.wav`) |
| POST | `/generate` | form `text`, optional `voice_path` | `audio/wav` |
| GET  | `/health` | — | `{ status: "ok" }` |
| GET  | `/docs` | — | Swagger UI |

## Control layer

`deploy.json` is the single source of truth (mode, default voice, endpoints, languages). Edit once, redeploy with `bash deploy.sh`.

## Production hardening (optional)

- Caddy/Nginx in front of `:8000` for HTTPS + bearer auth
- Run as systemd instead of `nohup`
- GPU build: install CUDA torch and switch `TTS(..., gpu=True)` in `xtts_engine.py`