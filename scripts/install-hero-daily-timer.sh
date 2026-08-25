#!/usr/bin/env bash
# Installe le timer user systemd LMDPT hero vidéo quotidienne (scoop → croquis N&B).
# Heure : reco Directrice de publication — 07:40 Europe/Paris (après renifleur/sync 07:15).
# Usage:
#   bash scripts/install-hero-daily-timer.sh
#   bash scripts/install-hero-daily-timer.sh --remove
set -euo pipefail

UNIT_NAME="lmdpt-hero-daily"
REPO="${LMDPT_REPO_PATH:-/home/debian/iarbre/le-media-du-premier-tour}"
# Reco Directrice (bot-analytics-views) — pic matinal FR info + post-sync data
ON_CALENDAR="${LMDPT_HERO_ON_CALENDAR:-*-*-* 07:40:00}"
REMOVE=false
[[ "${1:-}" == "--remove" ]] && REMOVE=true

USER_UNIT_DIR="${HOME}/.config/systemd/user"
mkdir -p "$USER_UNIT_DIR"

SERVICE_FILE="${USER_UNIT_DIR}/${UNIT_NAME}.service"
TIMER_FILE="${USER_UNIT_DIR}/${UNIT_NAME}.timer"

if $REMOVE; then
  systemctl --user stop "${UNIT_NAME}.timer" 2>/dev/null || true
  systemctl --user disable "${UNIT_NAME}.timer" 2>/dev/null || true
  rm -f "$SERVICE_FILE" "$TIMER_FILE"
  systemctl --user daemon-reload
  echo "Timer ${UNIT_NAME} retiré."
  exit 0
fi

if [[ ! -f "$REPO/package.json" ]]; then
  echo "Repo LMDPT introuvable: $REPO" >&2
  exit 1
fi

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=LMDPT hero daily video (scoop → croquis N&B + ffmpeg)
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=${REPO}
Environment=HOME=%h
# Après sync renifleur si dispo (best-effort, non bloquant)
ExecStartPre=-/bin/bash -lc 'export NVM_DIR="\$HOME/.nvm"; [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null 2>&1; cd "${REPO}" && npm run renifleur 2>/dev/null || true'
ExecStart=/bin/bash -lc 'export NVM_DIR="\$HOME/.nvm"; [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null 2>&1; cd "${REPO}" && npm run hero:daily:force'
StandardOutput=journal
StandardError=journal
EOF

cat > "$TIMER_FILE" <<EOF
[Unit]
Description=Timer LMDPT hero daily (07:40 Europe/Paris · post-renifleur)

[Timer]
OnCalendar=${ON_CALENDAR}
Persistent=true
RandomizedDelaySec=90
AccuracySec=1min
Unit=${UNIT_NAME}.service

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now "${UNIT_NAME}.timer"

# Linger so timer survives logout (best-effort)
loginctl enable-linger "$(id -un)" 2>/dev/null || true

echo "OK — ${UNIT_NAME}.timer actif (${ON_CALENDAR})"
systemctl --user list-timers "${UNIT_NAME}.timer" --no-pager || true
echo "Logs: journalctl --user -u ${UNIT_NAME}.service -n 50"
