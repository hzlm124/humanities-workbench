#!/usr/bin/env python3
"""Turn a book file into plain text and report what its text layer is like.

EPUB is read with the standard library; PDF needs pdftotext or pypdf; a scanned
PDF has no text layer and this says so (needs_ocr) instead of pretending.
Exit 0 whenever a report was produced, including a scanned PDF that needs OCR;
2 only when the file is missing or the format is not supported.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path


class Extract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def text(self):
        return "".join(self.parts)


def epub_text(path):
    parts = []
    with zipfile.ZipFile(path) as book:
        names = [name for name in book.namelist() if re.search(r"\.(x?html?|htm)$", name, re.I)]
        for name in sorted(names):
            parser = Extract()
            parser.feed(book.read(name).decode("utf-8", "replace"))
            body = parser.text().strip()
            if body:
                parts.append(body)
    return "\n\n".join(parts)


def pdf_text(path):
    tool = shutil.which("pdftotext")
    if tool:
        try:
            done = subprocess.run([tool, "-layout", str(path), "-"], capture_output=True, timeout=180)
            if done.returncode == 0:
                return done.stdout.decode("utf-8", "replace")
        except Exception:
            pass
    try:
        import pypdf  # type: ignore
        reader = pypdf.PdfReader(str(path))
        return "\n\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        return ""


def main(argv=None):
    parser = argparse.ArgumentParser(description="Extract text from a book file")
    parser.add_argument("file", help="epub, pdf, txt or md")
    parser.add_argument("--out", default="", help="directory for the .txt (default: beside the file)")
    parser.add_argument("--min-chars", type=int, default=200, help="below this, a PDF is treated as scanned")
    parser.add_argument("--json", action="store_true", help="print a JSON report")
    args = parser.parse_args(argv)

    path = Path(args.file)
    if not path.exists():
        report = {"file": str(path), "error": "no such file", "needs_ocr": False, "chars": 0}
        print(json.dumps(report, ensure_ascii=False) if args.json else report["error"], file=sys.stderr)
        return 2

    suffix = path.suffix.lower()
    if suffix == ".epub":
        fmt, text = "epub", epub_text(path)
    elif suffix == ".pdf":
        fmt, text = "pdf", pdf_text(path)
    elif suffix in (".txt", ".md", ".markdown"):
        fmt, text = "text", path.read_text(encoding="utf-8", errors="replace")
    else:
        report = {"file": str(path), "error": "unsupported format " + suffix, "needs_ocr": False, "chars": 0}
        print(json.dumps(report, ensure_ascii=False) if args.json else report["error"], file=sys.stderr)
        return 2

    stripped = len(re.sub(r"\s", "", text))
    needs_ocr = fmt == "pdf" and stripped < args.min_chars
    out_dir = Path(args.out) if args.out else path.parent
    target = out_dir / (path.stem + ".txt")
    if text.strip():
        out_dir.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
    report = {
        "file": str(path),
        "format": fmt,
        "chars": stripped,
        "needs_ocr": needs_ocr,
        "out": str(target) if text.strip() else "",
    }
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"{fmt}: {stripped} chars" + (f" -> {target}" if report["out"] else ""))
        if needs_ocr:
            print("no text layer: this looks scanned, needs OCR before reading")
    return 0


if __name__ == "__main__":
    sys.exit(main())
