#!/bin/bash
# Breakpoint live transcription: one Part C rehearsal run on the Mac Mini.
#
#   bash scripts/mac/rehearsal.sh check [NAME]             yt-dlp format check for the test links (C1)
#   bash scripts/mac/rehearsal.sh MINUTES --dry-run [NAME] capture and transcribe; nothing is posted anywhere
#   bash scripts/mac/rehearsal.sh MINUTES [NAME]           same, posting only to the local rehearsal site
#                                                                http://127.0.0.1:4317/breakpoint (started here)
# NAME picks the settings .local/rehearsal/config-NAME.json (else config.json, else collector/config.rehearsal.json)
# and keeps that run's results in .local/rehearsal/NAME/, so several named runs can go side by side.
# MINUTES 0 runs until Ctrl+C; a replay (simulateLive) stops by itself when the recording and its checks are done.
# Claude writes the settings and reads the results. Production is never touched.
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
BP="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$BP" || { echo "Repo not found at $BP"; exit 1; }
MODE=""; MIN=3; DRY=""; NAME="run"
for a in "$@"; do
  case "$a" in
    check) MODE=check ;;
    --dry-run) DRY="--dry-run" ;;
    ''|*[!0-9]*) NAME="$a" ;;
    *) MIN="$a" ;;
  esac
done
STATE=".local/rehearsal/$NAME"
mkdir -p "$STATE"
STAMP=$(date +%Y%m%d-%H%M%S)
CONFIG=".local/rehearsal/config-$NAME.json"
[ -f "$CONFIG" ] || CONFIG=.local/rehearsal/config.json
[ -f "$CONFIG" ] || CONFIG=collector/config.rehearsal.json
echo "Test: $NAME | settings: $CONFIG | results: $BP/$STATE"

if [ "$MODE" = "check" ]; then
  LOG="$STATE/check-$STAMP.log"
  .venv/bin/python - "$CONFIG" <<'PY' 2>&1 | tee "$LOG"
import json, subprocess, sys
sys.path.insert(0, 'collector')
import live
config = json.load(open(sys.argv[1]))
for stage in config['stages']:
    if not stage.get('enabled'):
        continue
    vid = live.video_id_from_url(stage.get('youtube', ''))
    print(f"\n== {stage['id']}: {stage.get('youtube')} -> video {vid}")
    if not vid:
        continue
    r = subprocess.run(['.venv/bin/yt-dlp', '--print', 'title:%(title)s | channel:%(channel)s | duration:%(duration_string)s | live:%(is_live)s', live.watch_url(vid)], capture_output=True, text=True, timeout=120)
    print(r.stdout.strip())
    r = subprocess.run(['.venv/bin/yt-dlp', '-F', live.watch_url(vid)], capture_output=True, text=True, timeout=120)
    print('\n'.join(r.stdout.splitlines()[-25:]))
    warn = [l for l in r.stderr.splitlines() if 'WARNING' in l or 'ERROR' in l]
    print('stderr warnings:', live.redact(' | '.join(warn))[:600] or 'none')
    try:
        url, fmt, is_live = live.resolve_audio(vid, config.get('ytFormat', 'bestaudio/best[height<=360]/worst'))
        print(f'resolver: format {fmt}, live={is_live}, https URL received (not printed)')
    except live.LiveError as e:
        print('resolver failed:', e)
PY
  echo; echo "CHECK DONE ($NAME). Log: $BP/$LOG"; exit 0
fi

DUR=$(( MIN * 60 ))
LOG="$STATE/run-$STAMP.log"
SERVER=""
if [ "$DRY" != "--dry-run" ]; then
  command -v node >/dev/null || { echo "Node is missing: brew install node"; exit 1; }
  node scripts/rehearsal.mjs --config "$CONFIG" > "$STATE/server-$STAMP.log" 2>&1 &
  SERVER=$!
  sleep 2
  echo "Rehearsal site: http://127.0.0.1:4317/breakpoint  (open it in a browser on this Mac)"
fi
# The collector is restarted 5 s after an unexpected exit (as launchd will on event days), so a crash or a
# kill -9 during a soak test resumes on its own. A replay that finished, or a start-up error, ends the run.
START_AT=0; RUN=""
start_collector() {
  START_AT=$(date +%s)
  .venv/bin/python collector/run.py --config "$CONFIG" --state "$STATE" $DRY >> "$LOG" 2>&1 &
  RUN=$!
  caffeinate -dims -w $RUN &
}
: > "$LOG"
start_collector
tail -n +1 -f "$LOG" &
TAIL=$!
finish() {
  trap - EXIT INT TERM
  kill -INT $RUN 2>/dev/null; wait $RUN 2>/dev/null
  kill $TAIL 2>/dev/null; [ -n "$SERVER" ] && kill $SERVER 2>/dev/null
  echo; echo "REHEARSAL RUN ENDED ($NAME). Log: $BP/$LOG"
  exit 0
}
trap finish EXIT INT TERM
END_AT=$(( $(date +%s) + DUR ))
while :; do
  [ "$DUR" -gt 0 ] && [ "$(date +%s)" -ge "$END_AT" ] && break
  if ! kill -0 $RUN 2>/dev/null; then
    wait $RUN; CODE=$?
    grep -q "All replayed recordings finished" "$LOG" && break
    if [ $(( $(date +%s) - START_AT )) -lt 20 ]; then echo "Collector stopped at start-up (code $CODE); see the log." >> "$LOG"; break; fi
    echo "$(date -u +%H:%M:%S)Z  rehearsal.sh: collector exited (code $CODE); restarting in 5 s, as launchd would" >> "$LOG"
    sleep 5; start_collector
  fi
  sleep 1
done
finish
