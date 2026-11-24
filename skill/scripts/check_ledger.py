#!/usr/bin/env python3
"""Validate a research source ledger (sources.jsonl).

Eight fields describe one source: id, title, kind, locator, availability,
read_level; author, year and note are optional. The point is not bureaucracy:
read_level decides what a claim may rest on, and locator decides whether
anyone else can follow the claim back.

Exit 0 when clean, 1 when there is at least one error.
"""
import argparse
import json
import re
import sys
from pathlib import Path

FIELDS = ["id", "title", "kind", "locator", "availability", "read_level"]
KINDS = {"archive", "book", "article", "newspaper", "statistics", "map", "oral", "web", "other"}
AVAILABILITY = {"open", "open-index", "subscription", "physical", "surrogate", "unobtainable"}
READ_LEVEL = {"full", "partial", "index-only", "quoted"}
ID_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{1,31}$")
REF_RE = re.compile(r"\b[A-Z]\d{2,4}\b")


def load(path):
    errors = []
    rows = []
    seen = set()
    text = path.read_text(encoding="utf-8", errors="replace")
    for number, line in enumerate(text.splitlines(), start=1):
        raw = line.strip()
        if not raw:
            continue
        try:
            row = json.loads(raw)
        except json.JSONDecodeError as exc:
            errors.append(f"line {number}: not JSON ({exc.msg})")
            continue
        if not isinstance(row, dict):
            errors.append(f"line {number}: not an object")
            continue
        for field in FIELDS:
            if not row.get(field):
                errors.append(f"line {number}: missing {field}")
        kind = row.get("kind")
        if kind and kind not in KINDS:
            errors.append(f"line {number}: unknown kind {kind}")
        avail = row.get("availability")
        if avail and avail not in AVAILABILITY:
            errors.append(f"line {number}: unknown availability {avail}")
        level = row.get("read_level")
        if level and level not in READ_LEVEL:
            errors.append(f"line {number}: unknown read_level {level}")
        if level == "quoted" and not row.get("note"):
            errors.append(f"line {number}: read_level quoted needs a note saying who it was quoted from")
        ident = row.get("id")
        if ident:
            if not ID_RE.match(ident):
                errors.append(f"line {number}: id {ident} should look like S001")
            if ident in seen:
                errors.append(f"line {number}: duplicate id {ident}")
            seen.add(ident)
        rows.append(row)
    return rows, errors


def check_references(rows, findings):
    errors = []
    known = {row.get("id") for row in rows if row.get("id")}
    cited = set()
    for path in sorted(findings.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="replace")
        for match in REF_RE.findall(text):
            if match.startswith("S") and match not in known:
                errors.append(f"{path.name}: cites {match}, which the ledger does not have")
            if match in known:
                cited.add(match)
    return errors, sorted(known - cited)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Validate sources.jsonl")
    parser.add_argument("ledger", nargs="?", default="sources.jsonl")
    parser.add_argument("--findings", help="directory of findings to cross-check citations")
    parser.add_argument("--json", action="store_true", help="print a JSON report")
    args = parser.parse_args(argv)

    path = Path(args.ledger)
    if not path.exists():
        print(f"no ledger at {path}", file=sys.stderr)
        return 1
    rows, errors = load(path)
    uncited = []
    if args.findings:
        ref_errors, uncited = check_references(rows, Path(args.findings))
        errors.extend(ref_errors)
    report = {"ledger": str(path), "rows": len(rows), "errors": errors, "uncited": uncited}
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"{len(rows)} sources, {len(errors)} problems")
        for line in errors:
            print(f"  error: {line}")
        if uncited:
            names = ", ".join(uncited[:12])
            print(f"  note: {len(uncited)} sources cited by nothing: {names}")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
