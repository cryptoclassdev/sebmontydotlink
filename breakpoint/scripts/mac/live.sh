#!/bin/bash
# Breakpoint live jobs on the Mac Mini, run by launchd: they keep running after Terminal closes,
# restart 15 s after a crash, and keep the Mac awake (caffeinate) while they run.
#
#   bash live.sh start  stages|x   start a job (stages = stage transcription, x = X monitor)
#   bash live.sh stop   stages|x   stop it (kill switch); stopping is safe, it resumes where it left off
#   bash live.sh status            both jobs: running or not, last log lines, today's model spend
#   bash live.sh logs   stages|x   follow a job's log (Ctrl+C stops following, not the job)
#   bash live.sh check  stages     2-minute dry run of the event settings against the live site: reads the
#                                  schedule and desk links, posts nothing, makes no model calls
#
# stages: collector/config.breakpoint-stages.json, state .local/stages
# x:      collector/config.breakpoint-x.json,      state .local/collector
set -u
BP="$(cd "$(dirname "$0")/../.." && pwd)"
PY="$BP/.venv/bin/python"
DOMAIN="gui/$(id -u)"
job() {
  case "$1" in
    stages) LABEL=link.sebmonty.breakpoint-stages; CONFIG=collector/config.breakpoint-stages.json; STATE=.local/stages ;;
    x)      LABEL=link.sebmonty.breakpoint-x;      CONFIG=collector/config.breakpoint-x.json;      STATE=.local/collector ;;
    *) echo "Name a job: stages or x"; exit 1 ;;
  esac
  PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
}
write_plist() {
  mkdir -p "$HOME/Library/LaunchAgents" "$BP/$STATE"
  cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/caffeinate</string><string>-dims</string>
    <string>$PY</string><string>$BP/collector/run.py</string>
    <string>--config</string><string>$CONFIG</string>
    <string>--state</string><string>$STATE</string>
  </array>
  <key>WorkingDirectory</key><string>$BP</string>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>15</integer>
  <key>StandardOutPath</key><string>$BP/$STATE/out.log</string>
  <key>StandardErrorPath</key><string>$BP/$STATE/err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>PYTHONUNBUFFERED</key><string>1</string>
  </dict>
</dict>
</plist>
PLIST_EOF
}
running() { launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; }
show() {
  job "$1"
  if running; then
    echo "== $1: loaded ($(launchctl print "$DOMAIN/$LABEL" 2>/dev/null | grep -E '^\s*(state|pid|last exit code) =' | tr -s ' ' | tr '\n' ';'))"
  else
    echo "== $1: not running"
  fi
  [ -f "$BP/$STATE/out.log" ] && tail -n 6 "$BP/$STATE/out.log" | cut -c1-200
  [ -s "$BP/$STATE/err.log" ] && { echo "-- recent errors:"; tail -n 3 "$BP/$STATE/err.log" | cut -c1-200; }
  if [ -f "$BP/$STATE/costs.csv" ]; then
    "$PY" -c "import csv,sys,datetime as d;t=d.datetime.now(d.timezone.utc).date().isoformat();r=[x for x in csv.DictReader(open(sys.argv[1])) if x['time'].startswith(t)];print(f'-- model spend today (UTC): \${sum(float(x[\"usd\"]) for x in r):.2f} over {len(r)} calls')" "$BP/$STATE/costs.csv"
  fi
}
[ -x "$PY" ] || { echo "Missing $PY: run the setup script first."; exit 1; }
case "${1:-}" in
  start)
    job "${2:-}"
    write_plist
    if running; then launchctl kickstart -k "$DOMAIN/$LABEL" && echo "Restarted $LABEL"; else launchctl bootstrap "$DOMAIN" "$PLIST" && echo "Started $LABEL"; fi
    sleep 3; show "$2" ;;
  stop)
    job "${2:-}"
    if running; then launchctl bootout "$DOMAIN/$LABEL" && echo "Stopped $LABEL"; else echo "$LABEL was not running"; fi ;;
  status) show stages; echo; show x ;;
  logs) job "${2:-}"; tail -n 40 -f "$BP/$STATE/out.log" ;;
  check)
    NAME="${2:-stages}"; job "$NAME"
    [ "$NAME" = "x" ] && { cd "$BP" && exec "$PY" collector/run.py --config "$CONFIG" --check-x; }
    cd "$BP" || exit 1
    mkdir -p .local/stages-check
    python_json=$("$PY" -c "import json,sys;c=json.load(open(sys.argv[1]));c['llm']={'provider':'none'};print(json.dumps(c))" "$CONFIG")
    echo "$python_json" > .local/stages-check/config.json
    echo "Dry run of the event settings for 2 minutes (model off, nothing posted)..."
    "$PY" collector/run.py --config .local/stages-check/config.json --state .local/stages-check --dry-run > .local/stages-check/run.log 2>&1 &
    RUN=$!; sleep 120; kill -INT $RUN 2>/dev/null; wait $RUN 2>/dev/null
    grep -v Fetching .local/stages-check/run.log | cut -c1-200
    echo; echo "CHECK DONE. Expect 'Waiting for the stream link on the desk' until the links are pasted, then 'Between sessions' or 'Session ...'." ;;
  *) sed -n '2,15p' "$0" ;;
esac
