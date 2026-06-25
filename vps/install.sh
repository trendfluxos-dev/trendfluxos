#!/usr/bin/env bash
# Voice Clone Studio — one-command production installer
# Usage (as root or with sudo):
#   curl -fsSL https://your-host/install.sh | bash -s -- voice.example.com
# Or local:
#   sudo bash install.sh voice.example.com
set -euo pipefail

DOMAIN="${1:-}"
APP_DIR="/opt/voice-clone"
SERVICE_USER="voice"

log() { printf "\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()  { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }
die() { printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root (or via sudo)."
[ -n "$DOMAIN" ] || die "Usage: bash install.sh <your-domain.tld>"

log "Installing system dependencies"
apt-get update -y
apt-get install -y python3 python3-pip python3-venv ffmpeg curl debian-keyring debian-archive-keyring apt-transport-https lsof

log "Creating service user: $SERVICE_USER"
id -u "$SERVICE_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$SERVICE_USER"

log "Provisioning $APP_DIR"
mkdir -p "$APP_DIR"
cp -f app.py xtts_engine.py requirements.txt deploy.json "$APP_DIR/"
mkdir -p "$APP_DIR/voices" "$APP_DIR/outputs"
chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"

log "Creating Python venv + installing requirements (this takes a while)"
sudo -u "$SERVICE_USER" python3 -m venv "$APP_DIR/.venv"
sudo -u "$SERVICE_USER" "$APP_DIR/.venv/bin/pip" install --upgrade pip
sudo -u "$SERVICE_USER" "$APP_DIR/.venv/bin/pip" install -r "$APP_DIR/requirements.txt"

log "Installing systemd service"
install -m 0644 voice-clone.service /etc/systemd/system/voice-clone.service
systemctl daemon-reload
systemctl enable --now voice-clone

log "Waiting for /health (XTTS first boot downloads ~2GB model)…"
for i in $(seq 1 80); do
  if curl -fsS http://127.0.0.1:8000/health >/dev/null 2>&1; then
    ok "Backend LIVE on 127.0.0.1:8000"
    break
  fi
  sleep 5
  [ "$i" -eq 80 ] && die "Backend never came up. Check: journalctl -u voice-clone -n 100"
done

log "Installing Caddy (auto-HTTPS reverse proxy)"
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -y && apt-get install -y caddy
fi

log "Writing Caddyfile for $DOMAIN"
sed "s/YOUR_DOMAIN/$DOMAIN/g" Caddyfile > /etc/caddy/Caddyfile
mkdir -p /var/log/caddy && chown -R caddy:caddy /var/log/caddy
systemctl reload caddy || systemctl restart caddy

log "Triggering warmup"
curl -fsS -X POST "http://127.0.0.1:8000/warmup" || true

ok "Done."
echo ""
echo "  Public endpoint : https://$DOMAIN"
echo "  Health          : https://$DOMAIN/health"
echo "  Logs            : journalctl -u voice-clone -f"
echo "  Zero-downtime restart : sudo systemctl restart voice-clone"
echo ""
echo "Next in Lovable: set secret XTTS_ENDPOINT_URL = https://$DOMAIN"