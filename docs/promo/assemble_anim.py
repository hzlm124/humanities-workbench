# -*- coding: utf-8 -*-
"""Mux recorded frames and narration into the promo video."""
import subprocess, pathlib, json, os, sys, shutil

BASE = pathlib.Path(__file__).resolve().parent
FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
FP = os.environ.get("FFPROBE") or shutil.which("ffprobe") or "ffprobe"
A = BASE / "audio"
FR = BASE / "frames_rec"
OUT = BASE / "workbench-promo.mp4"

tl = json.loads((BASE / "timeline.json").read_text(encoding="utf-8"))
n = len(tl["scenes"])
total = tl["total"]
fps = tl["fps"]
count = len(list(FR.glob("f*.jpg")))
print("frames on disk", count, "expected", round(total * fps))

inputs = ["-framerate", str(fps), "-i", str(FR / "f%05d.jpg")]
for i in range(n):
    inputs += ["-i", str(A / ("%02d.mp3" % (i + 1)))]

parts, mix = [], []
for i, sc in enumerate(tl["scenes"]):
    ms = int(round(sc["narr_start"] * 1000))
    parts.append("[%d:a]aresample=48000,adelay=%d:all=1[a%d]" % (i + 1, ms, i))
    mix.append("[a%d]" % i)
parts.append("%samix=inputs=%d:normalize=0:duration=longest,apad,atrim=0:%.3f,asetpts=N/SR/TB[aout]"
             % ("".join(mix), n, total))

cmd = [FF, "-y"] + inputs + [
    "-filter_complex", ";".join(parts),
    "-map", "0:v", "-map", "[aout]", "-t", "%.3f" % total,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(OUT),
]
r = subprocess.run(cmd, capture_output=True, text=True)
if r.returncode != 0:
    print("FFMPEG FAILED", r.returncode)
    print(r.stderr[-3000:])
    sys.exit(1)
out = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration,size",
                      "-of", "json", str(OUT)], capture_output=True, text=True)
print("done", json.loads(out.stdout)["format"])
