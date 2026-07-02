#!/usr/bin/env bash
# Installe ou retire le timer systemd lmdpt-sync-social (sync:all:social quotidien).
# Usage: sudo bash scripts/install-sync-timer.sh [--remove]
set -euo pipefail

UNIT_NAME="lmdpt-sync-social"
REPO="${LMDPT_REPO_PATH:-/home/debian/iarbre/le-media-du-premier-tour}"
DEBIAN_USER="${SVC_USER:-debian}"
REMOVE=false

if [[ "${1:-}" == "--remove" ]]; then
  REMOVE=true
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Exécuter avec sudo." >&2
  exit 1
fi

if [[ ! -f "$REPO/package.json" ]]; then
  echo "Repo LMDPT introuvable: $REPO" >&2
  exit 1
fi

SERVICE_FILE="/etc/systemd/system/${UNIT_NAME}.service"
TIMER_FILE="/etc/systemd/system/${UNIT_NAME}.timer"

if $REMOVE; then
  systemctl stop "${UNIT_NAME}.timer" 2>/dev/null || true
  systemctl disable "${UNIT_NAME}.timer" 2>/dev/null || true
  rm -f "$SERVICE_FILE" "$TIMER_FILE"
  systemctl daemon-reload
  echo "Timer ${UNIT_NAME} retiré."
  exit 0
fi

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=LMDPT sync:all:social (data + renifleur + veille + brouillon X)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=${DEBIAN_USER}
WorkingDirectory=${REPO}
Environment=HOME=/home/${DEBIAN_USER}
ExecStart=/bin/bash -lc 'export NVM_DIR="\$HOME/.nvm" && . "\$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run sync:all:social'
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

cat > "$TIMER_FILE" <<EOF
[Unit]
Description=Timer quotidien LMDPT sync:all:social (08:00)

[Timer]
OnCalendar=*-*-* 08:00:00
Persistent=true
Unit=${UNIT_NAME}.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now "${UNIT_NAME}.timer"
systemctl start "${UNIT_NAME}.service" || true

echo "OK — ${UNIT_NAME}.timer actif (08:00 daily)"
systemctl list-timers "${UNIT_NAME}.timer" --no-pager
