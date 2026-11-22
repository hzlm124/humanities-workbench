# -*- coding: utf-8 -*-
"""Assemble the promo video: light stills, xfade transitions, synced narration.

Needs ffmpeg >= 4.3 for the xfade filter. Point FFMPEG / FFPROBE at it if the
build is not on PATH. Without xfade the script falls back to a dip-to-page-colour
cut, which is all ffmpeg 4.1 can do.

Env knobs:
  XF_TRANS  xfade transition name (fade, fadewhite, smoothleft, circleopen ...)
  XF_DUR    transition length in seconds
  OUT       output file name inside this directory
"""
import subprocess, pathlib, json, sys, os, shutil

BASE = pathlib.Path(__file__).resolve().parent
FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
FP = os.environ.get("FFPROBE") or shutil.which("ffprobe") or "ffprobe"
A = BASE / "audio"
FPS = 30
XF = float(os.environ.get("XF_DUR", "0.4"))
TRANS = os.environ.get("XF_TRANS", "fade")
OUT = os.environ.get("OUT", "workbench-promo.mp4")
TAIL = XF + 1.0        # silence kept after each narration line
BG = "0xf6f7f9"
TAGS = ["01", "02", "03", "04", "05", "06"]


def run(cmd, label):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FFMPEG FAILED:", label, r.returncode)
        print(r.stderr[-3000:])
        sys.exit(1)
    return r


def dur(p):
    out = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration",
                          "-of", "json", str(p)], capture_output=True, text=True)
    return float(json.loads(out.stdout)["format"]["duration"])


def has_xfade():
    r = subprocess.run([FF, "-hide_banner", "-filters"], capture_output=True, text=True)
    return " xfade " in r.stdout


if not (A / "02.mp3").exists() or (A / "02.mp3").stat().st_size < 5000:
    run([FF, "-y", "-i", str(A / "02a.mp3"), "-i", str(A / "02b.mp3"),
         "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[out]",
         "-map", "[out]", str(A / "02.mp3")], "join 02")

ver = subprocess.run([FF, "-hide_banner", "-version"], capture_output=True, text=True).stdout.splitlines()[0]
print(ver)
XOK = has_xfade()

narr = [dur(A / (t + ".mp3")) for t in TAGS]
frames = [int(round((d + TAIL) * FPS)) for d in narr]
ov = int(round(XF * FPS)) if XOK else 0

start = []
acc = 0
for i, f in enumerate(frames):
    start.append(acc)
    acc += f - (ov if i < len(frames) - 1 else 0)
total = acc / FPS
print("trans", TRANS, XF, "xfade", XOK)
print("narr", [round(x, 2) for x in narr])
print("scene", [round(f / FPS, 2) for f in frames], "total", round(total, 2))

inputs = []
for i in range(len(frames)):
    inputs += ["-i", str(BASE / "frames" / ("s%d.png" % i))]
for t in TAGS:
    inputs += ["-i", str(A / (t + ".mp3"))]

parts = []
for i, f in enumerate(frames):
    chain = ("[%d:v]scale=2560:-1,"
             "zoompan=z='1+0.06*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
             ":d=%d:s=1920x1080:fps=%d,format=yuv420p,settb=AVTB"
             % (i, f, f, FPS))
    if i == 0:
        chain += ",fade=t=in:st=0:d=0.8:color=%s" % BG
    if not XOK:
        chain += ",fade=t=out:st=%.3f:d=%.3f:color=%s" % (max(0.0, f / FPS - 0.35), 0.35, BG)
    if i == len(frames) - 1:
        chain += ",fade=t=out:st=%.3f:d=0.9:color=%s" % (max(0.0, f / FPS - 0.9), BG)
    parts.append(chain + "[v%d]" % i)

if XOK:
    cur = "[v0]"
    for i in range(1, len(frames)):
        off = start[i] / FPS
        out = "[x%d]" % i if i < len(frames) - 1 else "[v]"
        parts.append("%s[v%d]xfade=transition=%s:duration=%.3f:offset=%.4f%s"
                     % (cur, i, TRANS, XF, off, out))
        cur = out
else:
    parts.append("".join("[v%d]" % i for i in range(len(frames)))
                 + "concat=n=%d:v=1:a=0[v]" % len(frames))

offset = len(frames)
amix = []
for i in range(len(frames)):
    lead = 0.4 if i == 0 else XF + 0.15
    ms = int(round((start[i] / FPS + lead) * 1000))
    parts.append("[%d:a]aresample=24000,adelay=%d:all=1,volume=1.0[a%d]" % (offset + i, ms, i))
    amix.append("[a%d]" % i)
parts.append("%samix=inputs=%d:normalize=0:duration=longest,apad,atrim=0:%.3f,asetpts=N/SR/TB[aout]"
             % ("".join(amix), len(amix), total))

run([FF, "-y"] + inputs + [
    "-filter_complex", ";".join(parts),
    "-map", "[v]", "-map", "[aout]", "-t", "%.3f" % total,
    "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    str(BASE / OUT),
], "encode")
p = BASE / OUT
print("done", OUT, p.stat().st_size, "bytes", round(dur(p), 2), "seconds")
