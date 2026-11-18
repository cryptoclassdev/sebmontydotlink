#!/bin/bash
# The Breakpoint API on the Mac Mini, used instead of Upstash (see scripts/mac-backend.mjs).
# Two launchd jobs: "backend" (the API with storage in files) and "tunnel" (a free Cloudflare quick tunnel
# that gives it a public https address for Vercel). Both keep running after Terminal closes and restart after a crash.
#
#   bash scripts/mac/backend.sh start    start (or restart) both, then print the tunnel address
#   bash scripts/mac/backend.sh url      print the tunnel address (Vercel env BREAKPOINT_BACKEND_URL)
#   bash scripts/mac/backend.sh restart  restart the backend only (after updating this checkout); the tunnel and its address stay
#   bash scripts/mac/backend.sh status   both jobs, recent log lines, and a test request through the tunnel
#   bash scripts/mac/backend.sh stop     stop both (storage stays in DATA)
#
# Run it from a checkout of main (not the jobs' folder), e.g. ~/breakpoint-live/backend/breakpoint.
# DATA (default ~/breakpoint-live/backend-data) keeps the stored records and logs.
# SECRETS (default ~/breakpoint-live/sebmontydotlink/breakpoint/.local/provider-secrets.json) holds the tokens.
# A quick tunnel's address changes whenever the tunnel restarts: then set the new one in Vercel and redeploy.
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
BP="$(cd "$(dirname "$0")/../.." && pwd)"
DATA="${DATA:-$HOME/breakpoint-live/backend-data}"
SECRETS="${SECRETS:-$HOME/breakpoint-live/sebmontydotlink/breakpoint/.local/provider-secrets.json}"
PORT=4318
DOMAIN="gui/$(id -u)"
AGENTS="$HOME/Library/LaunchAgents"
B_LABEL=link.sebmonty.breakpoint-backend
T_LABEL=link.sebmonty.breakpoint-tunnel

running() { launchctl print "$DOMAIN/$1" >/dev/null 2>&1; }
url() { grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$DATA/tunnel.err.log" 2>/dev/null | grep -v '//api\.' | tail -n 1; }
plist() { # label, log name, extra env xml, program arguments...
  local label="$1" log="$2" envxml="$3"; shift 3
  local args=""; for a in "$@"; do args="$args<string>$a</string>"; done
  cat > "$AGENTS/$label.plist" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key><array>$args</array>
  <key>WorkingDirectory</key><string>$BP</string>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$DATA/$log.out.log</string>
  <key>StandardErrorPath</key><string>$DATA/$log.err.log</string>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>$envxml</dict>
</dict>
</plist>
PLIST_EOF
}
up() { # label
  if running "$1"; then launchctl kickstart -k "$DOMAIN/$1" && echo "Restarted $1"
  else
    for i in 1 2 3 4 5; do launchctl bootstrap "$DOMAIN" "$AGENTS/$1.plist" 2>/dev/null && { echo "Started $1"; return; }; sleep 2; done
    launchctl bootstrap "$DOMAIN" "$AGENTS/$1.plist" || echo "Could not start $1; run this command again in a few seconds"
  fi
}
down() { if running "$1"; then launchctl bootout "$DOMAIN/$1" && echo "Stopped $1"; for i in $(seq 1 20); do running "$1" || break; sleep 0.5; done; else echo "$1 was not running"; fi; }

case "${1:-}" in
  start)
    NODE="$(command -v node)" || { echo "node not found: brew install node"; exit 1; }
    CF="$(command -v cloudflared)" || { echo "cloudflared not found: brew install cloudflared"; exit 1; }
    [ -f "$SECRETS" ] || { echo "Secrets file not found: $SECRETS (set SECRETS=...)"; exit 1; }
    mkdir -p "$AGENTS" "$DATA/cloudflared-home"
    plist "$B_LABEL" backend "" /usr/bin/caffeinate -dims "$NODE" "$BP/scripts/mac-backend.mjs" --data "$DATA" --secrets "$SECRETS" --port "$PORT"
    # HOME points away from ~/.cloudflared so an existing named-tunnel config there cannot interfere.
    plist "$T_LABEL" tunnel "<key>HOME</key><string>$DATA/cloudflared-home</string>" "$CF" tunnel --no-autoupdate --url "http://127.0.0.1:$PORT"
    : > "$DATA/tunnel.err.log"
    up "$B_LABEL"; up "$T_LABEL"
    echo "Waiting for the tunnel address..."
    for i in $(seq 1 30); do [ -n "$(url)" ] && break; sleep 1; done
    sleep 2; "$0" status ;;
  restart)
    running "$B_LABEL" || { echo "$B_LABEL is not running: use start"; exit 1; }
    launchctl kickstart -k "$DOMAIN/$B_LABEL" && echo "Restarted $B_LABEL (tunnel untouched)"
    sleep 3; "$0" status ;;
  url) u="$(url)"; [ -n "$u" ] && echo "$u" || { echo "No tunnel address yet; see $DATA/tunnel.err.log"; exit 1; } ;;
  status)
    for l in "$B_LABEL" "$T_LABEL"; do running "$l" && echo "== $l: running" || echo "== $l: not running"; done
    echo "-- backend log:"; tail -n 4 "$DATA/backend.out.log" 2>/dev/null | cut -c1-200; tail -n 3 "$DATA/backend.err.log" 2>/dev/null | cut -c1-200
    printf -- "-- local:  "; curl -s -m 10 -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:$PORT/breakpoint/api/health" || echo "no answer"
    u="$(url)"
    if [ -n "$u" ]; then printf -- "-- tunnel: "; curl -s -m 15 -o /dev/null -w '%{http_code}\n' "$u/breakpoint/api/health" || echo "no answer"; echo; echo "BREAKPOINT_BACKEND_URL=$u"
    else echo "-- tunnel: no address yet (see $DATA/tunnel.err.log)"; fi ;;
  stop) down "$T_LABEL"; down "$B_LABEL" ;;
  *) sed -n '2,15p' "$0" ;;
esac
