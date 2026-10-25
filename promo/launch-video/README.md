# Launch video

A 60-second, 1920×1080 launch video for WattWise. It has no voiceover, only an original
instrumental track. The music is synthesised by `music.py`, so it carries no licensing.

```bash
./promo/launch-video/build.sh   # → promo/launch-video/wattwise-launch.mp4
```

## How it is made

| File | Role |
|---|---|
| `capture.cjs` | Screenshots the real UI in dark mode at 2×, with the sizing API stubbed from `src/sample/frontend_samples.json` ("family home" case). |
| `launch.html` | The whole video as one page. `renderAt(t)` draws the frame at time `t` (seconds), so rendering is deterministic. |
| `render.cjs` | Steps `renderAt` through 1,800 frames (30 fps) in Playwright and saves JPEGs. |
| `music.py` | 120 BPM, A minor (Am–F–C–G). Pad, arpeggio, bass, drums and a lead, with hits on the scene cuts. |
| `build.sh` | Runs all of the above, then encodes with ffmpeg (H.264 + AAC, −14 LUFS). |

## Timeline

| Time | Scene | Music |
|---|---|---|
| 0:00 | "When the grid goes dark, what keeps your home running?" | Pad swell, filtered arp |
| 0:06 | Logo over the horizon glow, tagline | Impact, riser |
| 0:12 | Landing page in a browser | Drop: kick, bass, hats |
| 0:18 | "Three steps. One considered result." | |
| 0:22 | 01 Configure your system | |
| 0:28 | 02 Add your loads (live totals highlighted) | |
| 0:34 | 03 Spec sheet ("What to buy") | Snare roll |
| 0:40 | The four outputs: 0.86 kVA, 6 × 200 Ah, 3 × 400 W, 62.5 A | Lift, lead melody |
| 0:46 | Transparent model: constants + flow diagram | |
| 0:52 | Two sizing modes | |
| 0:56 | "Stop guessing. Size it with WattWise." + URL | Final chord, fade |
