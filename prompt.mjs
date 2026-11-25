/**
 * The methodology digest that actually reaches the model.
 *
 * The panel used to render profile.md and panel.json without ever putting them
 * in front of the model. This module turns the active config into a short block
 * registered as runtime context: cheap to assemble, re-sent only when it changes,
 * empty when the switch is off.
 */
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { tokenize } from './knowledge.mjs'
import { readState } from './state.mjs'

const MAX_DIGEST = 1600
export const SKILL_NAME = 'humanities-research'

/** Parsed panel.json per skill directory, invalidated by mtime. */
const panels = new Map()

export function readPanel(skillDir) {
  if (!skillDir) return null
  const path = join(skillDir, 'profile', 'panel.json')
  try {
    const mtime = statSync(path).mtimeMs
    const hit = panels.get(path)
    if (hit && hit.mtime === mtime) return hit.panel
    const panel = JSON.parse(readFileSync(path, 'utf8'))
    panels.set(path, { mtime, panel })
    return panel
  } catch {
    return null
  }
}

/** One line of text, cut on a character budget. */
export function clip(value, max) {
  const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

/** Red lines as labels, in the order the config lists them. */
export function redlineLabels(panel, limit) {
  const rows = panel && Array.isArray(panel.redlines) ? panel.redlines : []
  const out = []
  for (const row of rows) {
    if (out.length >= (limit || 4)) break
    const label = Array.isArray(row) ? row[1] : row
    const text = clip(label, 32)
    if (text) out.push(text)
  }
  return out
}

/** The digest itself. Pure: same inputs, same string. */
export function buildDigest(options) {
  const o = options || {}
  const panel = o.panel || null
  const name = clip(o.configName, 40) || '默认配置'
  const lines = []
  lines.push('人文社科工作台：方法论注入已开，当前配置「' + name + '」。面板页头绿灯可关。')
  const thesis = clip(panel && panel.thesis, 180)
  if (thesis) lines.push('框架：' + thesis)
  const reds = redlineLabels(panel, 4)
  if (reds.length) lines.push('红线：' + reds.join('；') + '。')
  const note = clip(panel && panel.redlineNote, 90)
  if (note) lines.push('红线优先级：' + note)
  const bounds = (panel && Array.isArray(panel.boundary) ? panel.boundary : []).slice(0, 2)
  const boundText = bounds.map(function (b) { return clip(b, 40) }).filter(Boolean)
  if (boundText.length) lines.push('边界：' + boundText.join('；') + '。')
  lines.push('执行：查证、推演、文本精读、设定审计这类任务，先加载 ' + SKILL_NAME + ' 技能，按它的命题表、来源层级、账本与定位符走；结论注明出处（来源、页码或段落号），没有定位符的结论标为待查。')
  const hint = clip(o.corpusHint, 200)
  if (hint) lines.push(hint)
  const text = lines.join('\n')
  return text.length > MAX_DIGEST ? text.slice(0, MAX_DIGEST - 1) + '…' : text
}

/** Bigram document frequency for a corpus, built once per corpus object. */
const vocab = new WeakMap()

export function corpusVocabulary(corpus) {
  if (!corpus || !Array.isArray(corpus.segments)) return null
  const hit = vocab.get(corpus)
  if (hit) return hit
  const df = new Map()
  for (const seg of corpus.segments) {
    const text = String(seg && seg.t ? seg.t : '').toLowerCase()
    const parts = text.replace(/[^\u3400-\u9fff]+/g, ' ').split(' ')
    for (const part of parts) {
      for (let i = 0; i + 1 < part.length; i++) {
        const token = part.slice(i, i + 2)
        df.set(token, (df.get(token) || 0) + 1)
      }
    }
  }
  vocab.set(corpus, df)
  return df
}

/**
 * Distinctive terms the user just used that also occur in the corpus. Common
 * bigrams are ignored, so a generic sentence does not trigger a hint.
 */
export function matchCorpus(corpus, text, options) {
  const o = options || {}
  const df = corpusVocabulary(corpus)
  if (!df || !text) return []
  const maxDf = Number(o.maxDf) || 60
  const minHits = Number(o.minHits) || 2
  const seen = new Set()
  const out = []
  for (const token of tokenize(String(text).slice(0, 600))) {
    if (!/^[\u3400-\u9fff]{2}$/.test(token)) continue
    if (seen.has(token)) continue
    seen.add(token)
    const n = df.get(token) || 0
    if (!n || n > maxDf) continue
    out.push(token)
    if (out.length >= (Number(o.limit) || 3)) break
  }
  return out.length >= minHits ? out : []
}

/** Last user message text, read defensively: a shape change must not throw. */
export function lastUserText(session) {
  try {
    const nodes = session && session.surface ? session.surface.nodes : null
    if (!nodes || !nodes.length || typeof session.eventAt !== 'function') return ''
    for (let i = nodes.length - 1; i >= 0; i--) {
      const event = session.eventAt(nodes[i])
      if (!event || event.type !== 'user/message') continue
      const content = event.data ? event.data.content : null
      if (typeof content === 'string') return content
      if (Array.isArray(content)) {
        return content.filter(function (part) { return part && part.type === 'text' }).map(function (part) { return String(part.text || '') }).join('\n')
      }
      return ''
    }
    return ''
  } catch {
    return ''
  }
}

/**
 * What the model should see for this assembly. Returns an empty string when
 * the methodology switch is off, so the block disappears entirely.
 */
export function digestFor(input) {
  const o = input || {}
  try {
    const state = o.state || readState()
    if (!state.method) return ''
    const panel = readPanel(o.skillDir)
    let corpusHint = ''
    if (state.corpus && o.corpus && o.userText) {
      const terms = matchCorpus(o.corpus, o.userText)
      if (terms.length) {
        corpusHint = '语料：本机字幕语料里出现过「' + terms.join('、') + '」，需要原话或时间码就调 hw_corpus 检索。'
      }
    }
    return buildDigest({ configName: (o.config && o.config.name) || '默认配置', panel, corpusHint })
  } catch {
    return ''
  }
}
