"""Original 60 s instrumental for the WattWise launch video (120 BPM, A minor, Am-F-C-G)."""
import wave
import numpy as np

SR = 44100
DUR = 60.0
BPM = 120
BEAT = 60 / BPM          # 0.5 s
BAR = BEAT * 4           # 2 s
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    sus = max(n - a - d - r, 0)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, s, max(d, 1)),
        np.full(sus, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def saw_soft(freq, dur, harmonics=12, detune=0.0):
    """Band-limited saw via additive sines; fewer harmonics = darker."""
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    f = freq * (1 + detune)
    for k in range(1, harmonics + 1):
        if f * k > SR / 2.2:
            break
        out += np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) / k
    return out


def fft_conv(x, h):
    n = len(x) + len(h) - 1
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[:len(x)]


def highpass_noise(n):
    w = rng.standard_normal(n)
    return np.diff(np.diff(w, prepend=0), prepend=0) * 0.25


# ── Harmony ────────────────────────────────────────────────────────────────
# Am, F, C, G — voiced around middle C
CHORDS = [
    (57, [57, 60, 64, 69]),  # Am
    (53, [57, 60, 65, 69]),  # F
    (48, [55, 60, 64, 67]),  # C
    (55, [55, 59, 62, 67]),  # G
]
bars = int(DUR / BAR)


def chord_at(bar):
    return CHORDS[bar % 4]


# ── Sidechain envelope (kick pump), active from 12 s to 56 s ──────────────
t_all = np.arange(N) / SR
pump = np.ones(N)
beat_phase = (t_all % BEAT) / BEAT
duck = 1 - 0.55 * np.exp(-beat_phase * 7)
mask = (t_all >= 12) & (t_all < 56)
pump[mask] = duck[mask]

# ── Pad ────────────────────────────────────────────────────────────────────
pad_L = np.zeros(N)
pad_R = np.zeros(N)
for b in range(bars):
    start = b * BAR
    _, notes = chord_at(b)
    dur = BAR + 0.6
    bright = 5 if start < 12 else 9
    if start >= 56:
        dur = DUR - start
    n = int(dur * SR)
    e = env_adsr(n, 0.35, 0.4, 0.8, 0.6)
    for note in notes:
        f = midi(note)
        l = saw_soft(f, dur, bright, -0.004)[:n] * e
        r = saw_soft(f, dur, bright, 0.004)[:n] * e
        i = int(start * SR)
        m = min(n, N - i)
        pad_L[i:i + m] += l[:m]
        pad_R[i:i + m] += r[:m]
# Swell in the intro, steady after
pad_gain = np.clip(t_all / 4, 0, 1) * 0.055
L += pad_L * pad_gain * pump
R += pad_R * pad_gain * pump

# ── Arp (16ths, plucked) ────────────────────────────────────────────────────
pluck_cache = {}


def pluck(note, bright):
    key = (note, bright)
    if key not in pluck_cache:
        dur = 0.32
        n = int(dur * SR)
        s = saw_soft(midi(note), dur, bright)[:n]
        e = np.exp(-np.arange(n) / SR * 13)
        e[:60] *= np.linspace(0, 1, 60)
        pluck_cache[key] = s * e
    return pluck_cache[key]


arp_L = np.zeros(N)
arp_R = np.zeros(N)
pattern = [0, 2, 1, 3, 2, 1, 3, 2, 0, 3, 1, 2, 3, 1, 2, 0]
for b in range(bars):
    bar_start = b * BAR
    if bar_start < 4 or bar_start >= 58:
        continue
    _, notes = chord_at(b)
    for s16 in range(16):
        t0 = bar_start + s16 * BEAT / 4
        if t0 >= 58:
            break
        note = notes[pattern[s16] % 4] + 12
        bright = 3 if t0 < 12 else 6
        vel = 0.9 if s16 % 4 == 0 else 0.6
        p = pluck(note, bright) * vel
        pan = 0.45 if s16 % 2 else -0.45
        i = int(t0 * SR)
        m = min(len(p), N - i)
        arp_L[i:i + m] += p[:m] * np.sqrt(0.5 * (1 - pan))
        arp_R[i:i + m] += p[:m] * np.sqrt(0.5 * (1 + pan))
# Ping-pong dotted-eighth delay
d = int(BEAT * 0.75 * SR)
dl, dr = arp_L.copy(), arp_R.copy()
for k in range(1, 5):
    g = 0.38 ** k
    src = arp_R if k % 2 else arp_L
    dst = dl if k % 2 else dr
    dst[d * k:] += src[:-d * k] * g
arp_gain = np.clip((t_all - 4) / 6, 0, 1) * 0.06
L += dl * arp_gain * pump
R += dr * arp_gain * pump

# ── Drums ──────────────────────────────────────────────────────────────────
kn = int(0.45 * SR)
kt = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (45 * kt + (110 / 18) * (1 - np.exp(-kt * 18)))) * np.exp(-kt * 7)
kick += 0.3 * np.exp(-kt * 300) * rng.standard_normal(kn) * 0.3
kick = np.tanh(kick * 1.6)

hn = int(0.08 * SR)
hat = highpass_noise(hn) * np.exp(-np.arange(hn) / SR * 60)

cn = int(0.35 * SR)
ct = np.arange(cn) / SR
clap = highpass_noise(cn) * (np.exp(-ct * 22) + 0.6 * np.exp(-np.maximum(ct - 0.012, 0) * 40) * (ct > 0.012))
clap += 0.25 * np.sin(2 * np.pi * 190 * ct) * np.exp(-ct * 30)

for b in range(bars):
    bar_start = b * BAR
    for beat in range(4):
        t0 = bar_start + beat * BEAT
        if 12 <= t0 < 56 and not (38 <= t0 < 40 and beat >= 2):
            add(kick, t0, 0, 0.55)
        if 20 <= t0 < 56 and beat in (1, 3):
            add(clap, t0, 0.05, 0.22)
        if 12 <= t0 < 56:
            add(hat, t0 + BEAT / 2, 0.3, 0.16)
            if t0 >= 24:
                add(hat, t0 + BEAT / 4, -0.3, 0.07)
                add(hat, t0 + 3 * BEAT / 4, -0.3, 0.07)
# Snare roll into the 40 s lift
for k in range(16):
    t0 = 38 + k * BEAT / 4
    add(clap, t0, 0, 0.08 + 0.14 * k / 16)

# ── Bass (8ths, root, sidechained) ─────────────────────────────────────────
bass = np.zeros(N)
for b in range(bars):
    bar_start = b * BAR
    if bar_start < 12 or bar_start >= 56:
        continue
    root, _ = chord_at(b)
    f = midi(root - 24)
    for e8 in range(8):
        t0 = bar_start + e8 * BEAT / 2
        dur = BEAT / 2 * 0.9
        n = int(dur * SR)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
        s *= env_adsr(n, 0.005, 0.08, 0.7, 0.03)
        i = int(t0 * SR)
        bass[i:i + n] += s[: N - i]
L += bass * 0.16 * pump
R += bass * 0.16 * pump

# ── Lead melody (40–56 s) ──────────────────────────────────────────────────
# (beat offset within 8-bar phrase, midi, length in beats)
melody = [
    (0, 76, 1.5), (1.5, 74, 0.5), (2, 72, 1), (3, 71, 1),
    (4, 72, 1.5), (5.5, 69, 0.5), (6, 72, 1), (7, 74, 1),
    (8, 76, 1), (9, 79, 1), (10, 76, 1), (11, 74, 1),
    (12, 74, 2), (14, 71, 1), (15, 74, 1),
]
lead_L = np.zeros(N)
lead_R = np.zeros(N)
for phrase_start in (40, 48):
    for off, note, ln in melody:
        t0 = phrase_start + off * BEAT
        if t0 >= 56:
            continue
        dur = ln * BEAT + 0.25
        n = int(dur * SR)
        tt = np.arange(n) / SR
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.clip(tt * 3, 0, 1)
        f = midi(note)
        ph = 2 * np.pi * f * np.cumsum(vib) / SR
        s = np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.18 * np.sin(3 * ph) + 0.08 * np.sin(4 * ph)
        s *= env_adsr(n, 0.02, 0.15, 0.75, 0.25)
        i = int(t0 * SR)
        m = min(n, N - i)
        lead_L[i:i + m] += s[:m]
        lead_R[i:i + m] += s[:m]
L += lead_L * 0.05
R += lead_R * 0.05

# ── FX: risers and impacts ────────────────────────────────────────────────
def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # Crude rising brightness: blend lowpassed (moving average) into raw noise
    k = 64
    lp = np.convolve(noise, np.ones(k) / k, mode="same")
    x = tt / dur
    s = lp * (1 - x) + highpass_noise(n) * 3 * x
    tone = np.sin(2 * np.pi * (200 * tt + 400 * tt ** 2 / dur))
    return (s * 0.6 + tone * 0.15) * x ** 2


def impact():
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 * tt + 30 * (1 - np.exp(-tt * 6)) / 6)) * np.exp(-tt * 2.2)
    air = rng.standard_normal(n) * np.exp(-tt * 3.5) * 0.25
    return np.tanh((boom + air) * 1.4)


add(riser(2.0), 4.0, 0, 0.12)
add(riser(4.0), 8.0, 0, 0.18)
add(riser(2.0), 38.0, 0, 0.14)
add(impact(), 6.0, 0, 0.35)
add(impact(), 12.0, 0, 0.45)
add(impact(), 40.0, 0, 0.3)
add(impact(), 56.0, 0, 0.4)

# Final sustained Am chord over the end card
n = int(4 * SR)
e = env_adsr(n, 0.05, 0.6, 0.6, 2.5)
for note in (45, 57, 60, 64, 69, 72):
    s = saw_soft(midi(note), 4, 7)[:n] * e
    add(s, 56.0, rng.uniform(-0.3, 0.3), 0.05)

# ── Reverb (convolution with decaying stereo noise) ───────────────────────
ir_n = int(2.2 * SR)
ir_t = np.arange(ir_n) / SR
ir_env = np.exp(-ir_t * 2.8)
irL = rng.standard_normal(ir_n) * ir_env
irR = rng.standard_normal(ir_n) * ir_env
irL[: int(0.02 * SR)] = 0
irR[: int(0.02 * SR)] = 0
wetL = fft_conv(L, irL)
wetR = fft_conv(R, irR)
wet_scale = 0.18 / max(np.abs(wetL).max(), 1e-9) * np.abs(L).max()
L = L + wetL * wet_scale
R = R + wetR * wet_scale

# ── Master: fades, soft clip, normalise ───────────────────────────────────
fade_in = np.clip(t_all / 0.8, 0, 1)
fade_out = np.clip((DUR - t_all) / 2.5, 0, 1)
master = fade_in * fade_out
L *= master
R *= master
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.3) / np.tanh(1.3) * 0.89
R = np.tanh(R / peak * 1.3) / np.tanh(1.3) * 0.89

pcm = (np.stack([L, R], axis=1) * 32767).astype("<i2")
with wave.open(__file__.rsplit("/", 1)[0] + "/music.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote music.wav", pcm.shape)
