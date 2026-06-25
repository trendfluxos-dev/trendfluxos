#!/usr/bin/env bash
# Tiny redeploy hook. Put behind a token-protected URL (e.g. /redeploy on Caddy)
# and point XTTS_DEPLOY_WEBHOOK_URL at it from Lovable.
set -euo pipefail
cd /opt/voice-clone
# Pull latest if you use git here:
# git pull --ff-only
/opt/voice-clone/.venv/bin/pip install -r requirements.txt >/dev/null
systemctl restart voice-clone
echo "ok"