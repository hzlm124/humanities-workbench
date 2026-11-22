# -*- coding: utf-8 -*-
"""Assemble the promo video: light stills, dip-to-white transitions, synced narration.

ffmpeg 4.1 has no xfade filter, so transitions are a 0.35s dip to the page colour
on both sides of each cut — on a light background this reads as a soft flash.
"""
import subprocess, pathlib, json, sys, os, shutil

BASE = pathlib.Path(__file__).resolve().parent
FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
FP = os.environ.get("FFPROBE") or shutil.which("ffprobe") or "ffprobe"
A = BASE / "audio"
FPS = 30
DIP = 0.35
TAIL = 1.0
BG = "0xf6f7f9"


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FFMPEG FAILED", r.returncode)
        print(r.stderr[-2000:])
        sys.exit(1)


def dur(p):
    out = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "json", str(p)],
                         capture_output=True, text=True)
    return float(json.loads(out.stdout)["format"]["duration"])


if not (A / "02.mp3").exists() or (A / "02.mp3").stat().st_size < 5000:
    run([FF, "-y", "-i", str(A / "02a.mp3"), "-i", str(A / "02b.mp3"),
         "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[out]", "-map", "[out]", str(A / "02.mp3")])

takes = ["01", "02", "03", "04", "05", "06"]
narr = [dur(A / (t + ".mp3")) for t in takes]
scene_dur = [d + TAIL for d in narr]
start = []
acc = 0.0
for d in scene_dur:
    start.append(acc)
    acc += d
total = acc
print("narr", [round(x, 2) for x in narr])
print("scene", [round(x, 2) for x in scene_dur], "total", round(total, 2))

inputs = []
for i in range(len(scene_dur)):
    inputs += ["-i", str(BASE / "frames" / ("s%d.png" % i))]
for t in takes:
    inputs += ["-i", str(A / (t + ".mp3"))]

parts = []
for i, dd in enumerate(scene_dur):
    frames = int(round(dd * FPS))
    parts.append(
        "[%d:v]scale=2560:-1,zoompan=z='1+0.06*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        ":d=%d:s=1920x1080:fps=%d,fade=t=in:st=0:d=%.2f:color=%s,"
        "fade=t=out:st=%.2f:d=%.2f:color=%s,format=yuv420p[v%d]"
        % (i, frames, frames, FPS, DIP, BG, max(0.0, dd - DIP), DIP, BG, i)
    )
parts.append("".join("[v%d]" % i for i in range(len(scene_dur))) + "concat=n=%d:v=1:a=0[v]" % len(scene_dur))

offset = len(scene_dur)
mix = []
for i in range(len(scene_dur)):
    ms = int(round(DIP * 1000))
    parts.append("[%d:a]aresample=24000,adelay=%d,apad,atrim=start=0:end=%.3f,asetpts=PTS-STARTPTS[a%d]"
                 % (offset + i, ms, scene_dur[i], i))
    mix.append("[a%d]" % i)
parts.append("%sconcat=n=%d:v=0:a=1[aout]" % ("".join(mix), len(mix)))

run([FF, "-y"] + inputs + [
    "-filter_complex", ";".join(parts),
    "-map", "[v]", "-map", "[aout]", "-t", "%.3f" % total,
    "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
    str(BASE / "workbench-promo.mp4"),
])
p = BASE / "workbench-promo.mp4"
print("done bytes", p.stat().st_size, "seconds", round(dur(p), 2))
