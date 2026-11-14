#!/bin/bash
# Breakpoint live transcription: Mac Mini setup. Run it from a clone of the repo:
#   bash breakpoint/scripts/mac/setup.sh 2>&1 | tee setup.log
# Installs the Homebrew tools, builds breakpoint/.venv with uv's own Python 3.12 (Homebrew's Python cannot load
# its XML parser on macOS 26, which breaks pip), installs mlx-whisper and yt-dlp, downloads the speech model and
# times a 30-second test clip. Safe to re-run. Prints no secrets.
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
BP="$(cd "$(dirname "$0")/../.." && pwd)"; REPO="$(dirname "$BP")"; BASE="$BP/.local"; mkdir -p "$BASE"
step(){ echo; echo "=== $* ==="; }

step "A1 preflight"
echo "arch: $(uname -m)"; echo "chip: $(sysctl -n machdep.cpu.brand_string)"
sysctl -n hw.memsize | awk '{printf "ram: %.0f GB\n",$1/1073741824}'
echo "macOS: $(sw_vers -productVersion)"; df -h ~ | tail -1
pmset -g | grep -E ' sleep|disksleep|displaysleep|powernap|autorestart'
echo "auto macOS updates: $(defaults read /Library/Preferences/com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates 2>/dev/null || echo unset)"

step "A2 tools"
if ! command -v brew >/dev/null; then echo "HOMEBREW MISSING: install from https://brew.sh then re-run"; exit 1; fi
brew install python@3.12 ffmpeg deno gh
command -v node >/dev/null || brew install node   # the local rehearsal site (Part C) needs Node
for t in python3.12 ffmpeg deno gh node git; do printf '%s: ' "$t"; command -v "$t" || echo missing; done
python3.12 --version; ffmpeg -version | head -1; deno --version | head -1; node --version

step "A3 code"
git -C "$REPO" status -sb | head -5; git -C "$REPO" log --oneline -1

step "A4 python env"
cd "$BP" || exit 1
PY="$(brew --prefix python@3.12)/bin/python3.12"
"$PY" - <<'PY'
import os, platform
f = '/System/Library/CoreServices/SystemVersion.plist'
try:
    os.stat(f); seen = 'yes'
except OSError as e:
    seen = 'no (' + type(e).__name__ + ': ' + str(e.strerror) + ')'
print('Python sees the macOS version:', platform.mac_ver()[0] or 'NO', '| SystemVersion.plist visible to Python:', seen)
PY
env | grep -iE '^(SYSTEM_VERSION|PYTHON|DYLD_|UV_|PIP_)' || echo "no Python-related environment variables"
echo "Homebrew Python XML parser: $("$PY" -c 'import pyexpat; print("ok")' 2>&1 | tail -1)"
# Homebrew's Python 3.12 cannot load its XML parser on this macOS, which breaks pip and platform.mac_ver().
# Use uv's own self-contained Python 3.12 for .venv instead (downloaded once into ~/.local/share/uv).
command -v uv >/dev/null || brew install uv
if [ ! -f .venv/.uv-managed ]; then
  rm -rf .venv
  UV_PYTHON_PREFERENCE=only-managed uv venv --python 3.12 .venv 2>&1 | tail -3 && touch .venv/.uv-managed
fi
echo "venv Python: $(.venv/bin/python -c 'import sys; print(sys.version.split()[0], sys.base_prefix)') | XML parser: $(.venv/bin/python -c 'import pyexpat; print("ok")' 2>&1 | tail -1)"
SP=$(.venv/bin/python -c "import sysconfig; print(sysconfig.get_paths()['purelib'])")
if [ -z "$(.venv/bin/python -c 'import platform; print(platform.mac_ver()[0])')" ]; then
  echo "Python still cannot see the macOS version; adding a local workaround inside .venv"
  cat > "$SP/breakpoint_macver.py" <<'PY'
# Local workaround for this Mac only (.venv is not in git): when platform.mac_ver() is empty,
# ask sw_vers for the version. Loaded at startup by breakpoint_macver.pth.
import platform, subprocess
_mac_ver = platform.mac_ver
def mac_ver(release='', versioninfo=('', '', ''), machine=''):
    found = _mac_ver(release, versioninfo, machine)
    if found[0]:
        return found
    try:
        version = subprocess.run(['/usr/bin/sw_vers', '-productVersion'], capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception:
        return found
    return (version or release, versioninfo, machine or platform.machine())
platform.mac_ver = mac_ver
PY
  echo "import breakpoint_macver" > "$SP/breakpoint_macver.pth"
fi
echo "venv Python sees the macOS version: $(.venv/bin/python -c 'import platform; print(platform.mac_ver()[0] or "NO")')"
uv pip install --python .venv/bin/python -U "yt-dlp[default]" mlx-whisper 2>&1 | tail -6
ls .venv/bin | grep -E '^(pip|yt-dlp)$' | tr '\n' ' '; echo
.venv/bin/python -c "import sys, mlx_whisper, yt_dlp; print('imports ok; python', sys.version.split()[0], '; yt-dlp', yt_dlp.version.__version__)"
.venv/bin/python -c "import mlx_whisper; help(mlx_whisper.transcribe)" > "$BASE/mlx-transcribe-help.txt" 2>&1
grep -nE 'def transcribe|path_or_hf_repo|initial_prompt|condition_on_previous_text|temperature|no_speech|language|decode_options' "$BASE/mlx-transcribe-help.txt" | head -20

step "A5 warm up (first run downloads about 1.6 GB)"
ffmpeg -y -loglevel error -f lavfi -i "sine=frequency=440:duration=5" -ar 16000 -ac 1 /tmp/tone.wav
say -o /tmp/bp-speech.aiff "Welcome back to Breakpoint in London. Next up on the main stage, the Jupiter team is announcing that JUP staking rewards move to a new schedule next quarter. Kamino says KMNO holders get a vote on the new lending vaults. Jito confirms JTO restaking is live on mainnet today, and Meteora is opening its dynamic liquidity pools to every Solana validator. Firedancer and Alpenglow both ship upgrades before the end of the year, according to Anza and the Agave client team. Phantom, Backpack and Solflare will support the new token standard on day one."
ffmpeg -y -loglevel error -i /tmp/bp-speech.aiff -t 30 -ar 16000 -ac 1 -c:a pcm_s16le /tmp/bp-speech.wav
.venv/bin/python - <<'PY'
import time, mlx_whisper
M = 'mlx-community/whisper-large-v3-turbo'
t = time.time(); mlx_whisper.transcribe('/tmp/tone.wav', path_or_hf_repo=M)
print('first call (download + load):', round(time.time() - t, 1), 's')
prompt = 'Solana, Breakpoint, Anza, Agave, Firedancer, Alpenglow, Jupiter, JUP, Jito, JTO, Kamino, KMNO, Meteora, MET, Phantom, Backpack, Solflare, validator.'
for i in range(3):
    t = time.time()
    r = mlx_whisper.transcribe('/tmp/bp-speech.wav', path_or_hf_repo=M, language='en', initial_prompt=prompt, condition_on_previous_text=False, temperature=0.0)
    print(f'30 s speech chunk, run {i + 1}:', round(time.time() - t, 2), 's')
print('TEXT:', r['text'].strip())
print('no_speech_prob per segment:', [round(s.get('no_speech_prob', 0), 3) for s in r['segments']])
PY

step "Secrets files (key names only, never values)"
for f in "$BP/.local/provider-secrets.json"; do
  if [ -f "$f" ]; then printf 'found %s: ' "$f"; python3 -c "import json,sys;print(sorted(json.load(open(sys.argv[1]))))" "$f"; else echo "none at $f"; fi
done
echo; echo "SETUP DONE"
