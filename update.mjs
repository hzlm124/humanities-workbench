/**
 * Upstream check: this plugin ships as a checkout, so "is there a newer
 * release" is a question about the GitHub repo, not about npm. The answer is
 * cached for six hours in the same state file the switches use.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO = 'hzlm124/humanities-workbench'
export const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`
export const RELEASES_PAGE = `https://github.com/${REPO}/releases`
export const CACHE_MS = 6 * 60 * 60 * 1000

/** Version of the checkout that is actually loaded. */
export function localVersion() {
  try {
    return JSON.parse(readFileSync(join(HERE, 'package.json'), 'utf8')).version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function parseVersion(value) {
  const m = String(value || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

/** Three-part comparison; an unparsable tag counts as equal, never as newer. */
export function compareVersion(a, b) {
  const x = parseVersion(a)
  const y = parseVersion(b)
  if (!x || !y) return 0
  for (let i = 0; i < 3; i += 1) {
    if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1
  }
  return 0
}

/** Release notes reduced to one readable line. */
export function cleanNotes(body, max = 300) {
  const text = String(body || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

export async function fetchLatest(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch
  if (typeof fetchImpl !== 'function') throw new Error('没有可用的 fetch')
  const timeoutMs = Number(options.timeoutMs) || 8000
  const token = options.token || process.env.HW_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'humanities-workbench' }
  if (token) headers.authorization = `Bearer ${token}`
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetchImpl(LATEST_URL, { headers, signal: ac.signal })
    if (!res || !res.ok) throw new Error(`GitHub ${res ? res.status : '无响应'}`)
    const body = await res.json()
    return {
      latest: String((body && body.tag_name) || '').replace(/^v/i, ''),
      url: (body && body.html_url) || RELEASES_PAGE,
      notes: cleanNotes(body && body.body),
      publishedAt: (body && body.published_at) || '',
    }
  } finally {
    clearTimeout(timer)
  }
}

function report(version, record, cached, error) {
  const latest = record && record.latest ? String(record.latest) : ''
  const out = {
    version,
    latest,
    behind: Boolean(latest) && compareVersion(version, latest) < 0,
    url: (record && record.url) || RELEASES_PAGE,
    notes: (record && record.notes) || '',
    publishedAt: (record && record.publishedAt) || '',
    checkedAt: (record && record.checkedAt) || '',
    cached: Boolean(cached),
  }
  if (error) out.error = error
  return out
}

function shortError(error) {
  const message = String((error && error.message) || error || '请求失败')
  if (/abort/i.test(message)) return '连接超时'
  return message.slice(0, 80)
}

/**
 * Ask GitHub whether a newer release exists. A cached answer younger than
 * CACHE_MS wins unless force is set; a failed request falls back to the cache.
 */
export async function checkUpdate(options = {}) {
  const version = localVersion()
  const now = Number(options.now) || Date.now()
  const cached = options.state && options.state.update && typeof options.state.update === 'object' ? options.state.update : null
  const stamp = cached && Date.parse(cached.checkedAt || '')
  const fresh = Boolean(cached && cached.latest && Number.isFinite(stamp) && now - stamp < CACHE_MS)
  if (fresh && !options.force) return { ...report(version, cached, true), record: null }
  try {
    const remote = await fetchLatest(options)
    const record = { ...remote, checkedAt: new Date(now).toISOString() }
    return { ...report(version, record, false), record }
  } catch (error) {
    const message = shortError(error)
    if (cached && cached.latest) return { ...report(version, cached, true, message), record: null }
    return { ...report(version, null, false, message), record: null }
  }
}
