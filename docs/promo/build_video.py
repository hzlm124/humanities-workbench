# -*- coding: utf-8 -*-
import subprocess, pathlib, json, sys

BASE = pathlib.Path(r"D:\dsh-humanities-workbench\docs\promo")
FF = r"ffmpeg\ffmpeg.exe"
FP = r"ffmpeg\ffprobe.exe"
A = BASE / "audio"
FPS = 30

def dur(p):
    out = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "json", str(p)],
                         capture_output=True, text=True)
    return float(json.loads(out.stdout)["format"]["duration"])

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FFMPEG FAILED", r.returncode)
        print(r.stderr[-2500:])
        sys.exit(1)

segs = ["01", "02a", "02b", "03", "04", "05", "06"]
d = {s: dur(A / (s + ".mp3")) for s in segs}
groups = [[segs[0]], [segs[1], segs[2]], [segs[3]], [segs[4]], [segs[5]], [segs[6]]]
scene_dur = [sum(d[s] for s in g) for g in groups]
print("durations", [round(x, 2) for x in scene_dur], "total", round(sum(scene_dur), 2))

inputs = []
for s in segs:
    inputs += ["-i", str(A / (s + ".mp3"))]
filt = "".join("[%d:a]" % i for i in range(len(segs))) + "concat=n=%d:v=0:a=1[out]" % len(segs)
run([FF, "-y"] + inputs + ["-filter_complex", filt, "-map", "[out]", "-c:a", "aac", "-b:a", "192k", str(BASE / "voice.m4a")])

inputs = []
for i, dd in enumerate(scene_dur):
    inputs += ["-i", str(BASE / "frames" / ("s%d.png" % i))]
inputs += ["-i", str(BASE / "voice.m4a")]

parts = []
for i, dd in enumerate(scene_dur):
    frames = max(2, int(round(dd * FPS)))
    parts.append(
        "[%d:v]scale=2560:-1,zoompan=z='min(zoom+0.00045,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        ":d=%d:s=1920x1080:fps=%d,fade=t=in:st=0:d=0.45,fade=t=out:st=%.2f:d=0.45[v%d]"
        % (i, frames, FPS, max(0.0, dd - 0.45), i)
    )
parts.append("".join("[v%d]" % i for i in range(len(scene_dur))) + "concat=n=%d:v=1:a=0[v]" % len(scene_dur))

run([FF, "-y"] + inputs + [
    "-filter_complex", ";".join(parts),
    "-map", "[v]", "-map", "%d:a" % len(scene_dur),
    "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "19",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
    "-shortest", str(BASE / "workbench-promo.mp4"),
])
p = BASE / "workbench-promo.mp4"
print("done bytes", p.stat().st_size, "seconds", round(dur(p), 2))
