# Voice Clone Studio — VPS Deployment Package

Production-grade XTTS-v2 backend. Pairs with TrendFlux `/voice-clone` studio, `/voice-clone/deploy` console, and the `xtts-proxy` / `xtts-deploy` edge functions.

## Pick your path

| Path | Best for | Command |
|---|---|---|
| **Dev / quick test** | Local box, smoke-test | `bash deploy.sh` |
| **Production (systemd + Caddy HTTPS)** | Single VPS, sellable | `sudo bash install.sh voice.example.com` |
| **Production (Docker)** | Portable, reproducible | `docker compose up -d` |

All three serve the same API:

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/upload-voice` | multipart `file` | `{ voice_path }` (overwrites `voices/latest.wav`, triggers warmup) |
| POST | `/generate` | form `text`, optional `voice_path` | `audio/wav` (single-flight lock) |
| POST | `/warmup` | — | `{ warm: bool }` — manually warm the model |
| GET  | `/health` | — | `{ status: "ok" }` |
| GET  | `/docs` | — | Swagger UI |

## Production hardening included

- **`voice-clone.service`** — systemd unit with auto-restart, journald logs, sandbox hardening
- **`Caddyfile`** — auto-HTTPS (Let's Encrypt), gzip+zstd, 5-min timeouts for slow first synth, log rotation
- **`Dockerfile` + `docker-compose.yml`** — CPU build, persistent model cache, healthcheck (300s start period)
- **`install.sh`** — one-command installer: deps → venv → systemd → Caddy + HTTPS → warmup → ready
- **`deploy-webhook.sh`** — tiny redeploy script you can expose at a token-protected URL for the Lovable Deploy button
- **Warmup on boot + on every upload** — eliminates cold-start latency
- **Single-flight `/generate` lock** — prevents concurrent CPU saturation
- **Zero-downtime-ish restart** — `systemctl restart voice-clone` (Caddy buffers in-flight requests)

## Wire to TrendFlux (Lovable)

Set these secrets in Lovable:
- **`XTTS_ENDPOINT_URL`** = `https://voice.example.com` (your Caddy-fronted domain)
- **`XTTS_API_TOKEN`** *(required)* = bearer token. Must match `XTTS_API_TOKEN` on the VPS (systemd unit / compose env) and the `Bearer` value in the `Caddyfile`. Without it the VPS returns 503 on every protected endpoint.
- **`XTTS_DEPLOY_WEBHOOK_URL`** *(optional)* = `https://voice.example.com/redeploy` (route `deploy-webhook.sh`)
- **`XTTS_DEPLOY_WEBHOOK_TOKEN`** *(optional)* = bearer for the webhook

Then the `/voice-clone/deploy` page lights up: live status, one-click deploy, smoke test.

## Operations cheatsheet

```bash
# Tail logs
journalctl -u voice-clone -f

# Restart (graceful)
sudo systemctl restart voice-clone

# Warmup manually
curl -X POST http://127.0.0.1:8000/warmup

# Health
curl https://voice.example.com/health
```

## GPU build (optional)

Install CUDA torch and change `TTS(..., gpu=True)` in `xtts_engine.py`. Single-flight lock can be relaxed once GPU memory headroom is confirmed.