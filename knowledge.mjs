/**
 * Corpus layer: turn a local subtitle collection into searchable segments.
 * Pure functions, no DSH services. The index is derived data and never shipped
 * in the package.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { readTextFile } from './tools.mjs'

const SEG_MIN = 60
const SEG_MAX = 160
const BVID = /BV[0-9A-Za-z]{10}/

/** Seconds to mm:ss (or h:mm:ss past an hour). */
export function clock(sec) {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return ''
  const s = Math.max(0, Math.round(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(r).padStart(2, '0')
  return h ? h + ':' + mm + ':' + ss : mm + ':' + ss
}

/** Parse SRT into cues. Tolerates BOM, CRLF and MM:SS,mmm short forms. */
export function parseSrt(raw) {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r/g, '')
  const out = []
  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const timeIdx = lines.findIndex((l) => l.includes('-->'))
    if (timeIdx < 0) continue
    const m = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[,.](\d{1,3})\s*-->\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[,.](\d{1,3})/.exec(lines[timeIdx])
    if (!m) continue
    const sec = (h, mi, s, ms) => (Number(h || 0) * 3600) + (Number(mi) * 60) + Number(s) + (Number(ms.padEnd(3, '0')) / 1000)
    const body = lines.slice(timeIdx + 1).join(' ').replace(/<[^>]+>/g, '').trim()
    if (!body) continue
    out.push({ start: sec(m[1], m[2], m[3], m[4]), end: sec(m[5], m[6], m[7], m[8]), text: body })
  }
  return out
}

/** Merge cues into segments of SEG_MIN..SEG_MAX characters, keeping time bounds. */
export function segmentsFromCues(cues) {
  const segments = []
  let buf = ''
  let start = null
  let end = null
  const flush = () => {
    const t = buf.trim()
    if (t.length >= 10) segments.push({ start, end, text: t })
    buf = ''
    start = null
    end = null
  }
  for (const cue of cues) {
    if (!buf) start = cue.start
    buf += cue.text
    end = cue.end
    if (buf.length >= SEG_MIN) {
      const cut = /[。？！?!…]\s*$/.test(buf) || buf.length >= SEG_MAX
      if (cut) flush()
    }
  }
  flush()
  return segments
}

/** Split a plain-text transcript into segments without time bounds. */
export function segmentsFromText(raw) {
  const sentences = String(raw).replace(/\s+/g, ' ').match(/[^。？！?!.]+[。？！?!.]?/g) || []
  const segments = []
  let buf = ''
  for (const s of sentences) {
    buf += s
    if (buf.length >= SEG_MIN) { segments.push({ start: null, end: null, text: buf.trim() }); buf = '' }
  }
  if (buf.trim()) segments.push({ start: null, end: null, text: buf.trim() })
  return segments
}

/** Build a corpus object from a subtitle directory. */
export function buildCorpus(subsDir) {
  if (!subsDir || !existsSync(subsDir)) throw new Error('字幕目录不存在：' + subsDir)
  const sources = []
  const segments = []
  for (const file of readdirSync(subsDir).filter((n) => /\.(srt|txt)$/i.test(n)).sort()) {
    const raw = readTextFile(join(subsDir, file))
    const bvid = (BVID.exec(file) || [file.replace(/\.[^.]+$/, '')])[0]
    const isSrt = /\.srt$/i.test(file)
    const cues = isSrt ? parseSrt(raw) : []
    const parts = isSrt ? segmentsFromCues(cues) : segmentsFromText(raw)
    for (const p of parts) {
      segments.push({ b: bvid, f: file, s: p.start, e: p.end, t: p.text })
    }
    sources.push({ file, bvid, cues: cues.length, segments: parts.length, chars: raw.length })
  }
  return {
    version: 1,
    builtAt: new Date().toISOString(),
    subsDir,
    sources,
    stats: { files: sources.length, segments: segments.length, chars: segments.reduce((n, s) => n + s.t.length, 0) },
    segments,
  }
}

/** Bigrams for CJK, words for latin; stable and dependency free. */
export function tokenize(query) {
  const text = String(query || '').toLowerCase().trim()
  const tokens = new Set()
  for (const w of text.match(/[a-z0-9][a-z0-9_-]*/g) || []) tokens.add(w)
  const cjk = text.replace(/[^\u3400-\u9fff]/g, '')
  if (cjk.length === 1) tokens.add(cjk)
  for (let i = 0; i + 1 < cjk.length; i++) tokens.add(cjk.slice(i, i + 2))
  return [...tokens]
}

/**
 * Rank segments by IDF-weighted coverage: a rare bigram counts for more than a
 * common one, so "证据分级" does not match every segment that says "证据".
 */
export function search(corpus, query, limit = 8, minScore = 0.2) {
  const tokens = tokenize(query)
  if (!corpus || !Array.isArray(corpus.segments) || !tokens.length) return []
  const segments = corpus.segments
  const total = segments.length

  const df = new Map()
  for (const tk of tokens) {
    let n = 0
    for (const seg of segments) if (seg.t.toLowerCase().includes(tk)) n++
    df.set(tk, n)
  }
  const weight = new Map()
  let weightSum = 0
  for (const tk of tokens) {
    const w = Math.log(1 + total / Math.max(df.get(tk), 1))
    weight.set(tk, w)
    weightSum += w
  }
  if (!weightSum) return []

  // A long query needs more than one matched piece, otherwise a common bigram
  // alone drags unrelated segments in.
  const floor = tokens.length >= 3 ? Math.max(minScore, 0.3) : minScore
  const scored = []
  for (const seg of segments) {
    const hay = seg.t.toLowerCase()
    let got = 0
    let hits = 0
    for (const tk of tokens) {
      if (hay.includes(tk)) { got += weight.get(tk); hits++ }
    }
    if (!hits) continue
    const score = got / weightSum
    if (score < floor) continue
    scored.push({ seg, score, hits })
  }
  scored.sort((a, b) => (b.score - a.score) || (b.hits - a.hits) || (a.seg.t.length - b.seg.t.length))
  return scored.slice(0, limit).map((row) => ({
    bvid: row.seg.b,
    file: row.seg.f,
    at: clock(row.seg.s),
    start: row.seg.s,
    end: row.seg.e,
    score: Number(row.score.toFixed(3)),
    hits: row.hits,
    text: row.seg.t,
  }))
}

export function saveCorpus(path, corpus) {
  writeFileSync(path, JSON.stringify(corpus), 'utf8')
  return path
}

export function loadCorpus(path) {
  if (!existsSync(path)) return null
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    return parsed && Array.isArray(parsed.segments) ? parsed : null
  } catch {
    return null
  }
}

/** Load the index only when it is newer than the subtitle directory. */
export function corpusStatus(path, subsDir) {
  const exists = existsSync(path)
  const indexAt = exists ? statSync(path).mtimeMs : 0
  const dirAt = subsDir && existsSync(subsDir) ? statSync(subsDir).mtimeMs : 0
  return { exists, stale: !exists || dirAt > indexAt, indexAt, dirAt }
}
