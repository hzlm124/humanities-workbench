# -*- coding: utf-8 -*-
"""Build the timeline for the animated promo from the narration durations."""
import subprocess, pathlib, json, os, shutil

BASE = pathlib.Path(__file__).resolve().parent
A = BASE / "audio"
FP = os.environ.get("FFPROBE") or shutil.which("ffprobe") or "ffprobe"
FPS = 30
LEAD = 1.05      # text fully settled before the line starts
TAIL = 0.55      # hold after the line ends
OVERLAP = 0.90   # exit finishes before the next scene starts entering
TAGS = ["01", "02", "03", "04", "05", "06"]


def dur(p):
    out = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration",
                          "-of", "json", str(p)], capture_output=True, text=True)
    return float(json.loads(out.stdout)["format"]["duration"])


narr = [dur(A / (t + ".mp3")) for t in TAGS]
scenes = []
acc = 0.0
for i, d in enumerate(narr):
    length = LEAD + d + TAIL
    scenes.append({"i": i, "start": round(acc, 4), "end": round(acc + length, 4),
                   "narr": round(d, 4), "narr_start": round(acc + LEAD, 4)})
    acc = acc + length - (OVERLAP if i < len(narr) - 1 else 0)
total = round(acc, 4)

tl = {"fps": FPS, "total": total, "lead": LEAD, "tail": TAIL, "overlap": OVERLAP,
      "width": 1920, "height": 1080, "scenes": scenes}
(BASE / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1), encoding="utf-8")
print("total", total, "frames", round(total * FPS))
for s in scenes:
    print(" s%d  start %.2f  end %.2f  narr %.2f" % (s["i"], s["start"], s["end"], s["narr"]))
