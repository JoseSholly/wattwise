#!/usr/bin/env bash
# Builds wattwise-launch.mp4 (1920x1080, 30 fps, 60 s, music only).
# Needs: npm deps installed in the repo root, Playwright + Chromium, ffmpeg, python3 + numpy.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=../..

# Brand fonts, self-hosted from the app's own dependencies.
mkdir -p fonts
cp "$ROOT"/node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2 fonts/
cp "$ROOT"/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2 fonts/
cp "$ROOT"/node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2 fonts/

# 1. Screenshots of the real UI.
(cd "$ROOT" && npx vite --port 5173 --strictPort >/dev/null 2>&1) &
VITE=$!
trap 'kill $VITE 2>/dev/null || true' EXIT
until curl -sf http://localhost:5173 >/dev/null; do sleep 0.5; done
node capture.cjs
kill $VITE

# 2. Soundtrack.
python3 music.py

# 3. Frames, 4 workers in parallel.
rm -rf frames && mkdir frames
for i in 0 1 2 3; do node render.cjs "$i" 4 & done
wait

# 4. Encode.
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i frames/f%05d.jpg -i music.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -tune film \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 \
  -shortest -movflags +faststart wattwise-launch.mp4
echo "wrote $(pwd)/wattwise-launch.mp4"
