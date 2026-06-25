#!/usr/bin/env bash
# Voice Clone Studio — one-command VPS deploy
# Usage: bash deploy.sh
set -euo pipefail

CONFIG="$(dirname "$0")/deploy.json"
PORT="${PORT:-8000}"

echo "🚀 Deploying Voice Clone Studio..."
echo "   Config: $CONFIG"
echo "   Port:   $PORT"

# 1. System deps (Ubuntu/Debian)
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y python3 python3-pip python3-venv ffmpeg curl
fi

# 2. Python venv
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

# 3. Install requirements
pip install --upgrade pip
pip install -r requirements.txt

# 4. Folders
mkdir -p voices outputs

# 5. Kill any old instance on this port
if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "🛑 Killing existing process on :$PORT"
  kill -9 "$(lsof -ti:"$PORT")" || true
fi

# 6. Boot FastAPI (background, logs to server.log)
nohup uvicorn app:app --host 0.0.0.0 --port "$PORT" > server.log 2>&1 &
echo "⏳ Booting XTTS-v2 (first run downloads model, can take 2–5 min)..."

# 7. Health check loop (up to ~5 min)
for i in $(seq 1 60); do
  sleep 5
  if curl -fsS "http://localhost:$PORT/docs" >/dev/null 2>&1; then
    echo "✅ Voice Clone Studio LIVE on :$PORT"
    echo "   Upload:   POST http://localhost:$PORT/upload-voice"
    echo "   Generate: POST http://localhost:$PORT/generate"
    echo ""
    echo "👉 Next: set XTTS_ENDPOINT_URL secret in TrendFlux to:"
    echo "        http://<this-server-public-ip>:$PORT"
    exit 0
  fi
  echo "   ...still booting ($((i*5))s)"
done

echo "❌ Health check failed. Last logs:"
tail -n 50 server.log || true
exit 1