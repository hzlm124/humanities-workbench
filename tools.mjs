/**
 * Reader tools: page text, Wikipedia extracts, Bilibili transcripts.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { lookup } from 'node:dns/promises'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const COOKIES = join(homedir(), '.dsh', 'humanities-workbench', 'cookies.json')
const MAX_BYTES = 5 * 1024 * 1024
const MAX_REDIRECTS = 5

/** Cookie header for a host, from an optional cookies.json keyed by host suffix. */
export function cookieFor(host) {
  try {
    const map = JSON.parse(readFileSync(COOKIES, 'utf8'))
    for (const key of Object.keys(map)) {
      if (host === key || host.endsWith('.' + key)) return map[key]
    }
  } catch { /* no cookie file is normal */ }
  return ''
}

function isPrivateV4(ip) {
  const p = ip.split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const [a, b] = p
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  if (a === 198 && (b === 18 || b === 19)) return true
  return a >= 224
}

/** Loopback, link-local, private and metadata ranges, v4 and v6. */
export function isPrivateIp(value) {
  const s = String(value).toLowerCase().replace(/^\[|\]$/g, '')
  const mapped = s.startsWith('::ffff:') ? s.slice(7) : s
  if (/^\d+\.\d+\.\d+\.\d+$/.test(mapped)) return isPrivateV4(mapped)
  if (s === '::' || s === '::1') return true
  if (/^f[cd][0-9a-f]{2}:/.test(s)) return true
  if (/^fe[89ab][0-9a-f]:/.test(s)) return true
  return false
}

const BLOCKED_HOSTS = new Set(['localhost', 'metadata', 'metadata.google.internal'])

/** Reject anything that is not a public http(s) endpoint. */
export async function assertFetchable(url) {
  let parsed
  try { parsed = new URL(url) } catch { throw new Error('地址无效：' + url) }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('只支持 http 与 https')
  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!host) throw new Error('地址缺少主机名')
  if (BLOCKED_HOSTS.has(host) || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('拒绝访问内网地址：' + host)
  }
  if (isPrivateIp(host)) throw new Error('拒绝访问内网地址：' + host)
  const literal = /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(':')
  if (literal) return parsed
  let list = []
  try { list = await lookup(host, { all: true }) } catch { throw new Error('域名解析失败：' + host) }
  if (!list.length) throw new Error('域名解析为空：' + host)
  if (list.some((row) => isPrivateIp(row.address))) throw new Error('域名指向内网地址：' + host)
  return parsed
}

function charsetOf(contentType, bytes) {
  const fromHeader = /charset=([\w-]+)/i.exec(contentType || '')
  if (fromHeader) return fromHeader[1].toLowerCase()
  const head = Buffer.from(bytes.slice(0, 2048)).toString('latin1')
  const fromMeta = /charset=["']?([\w-]+)/i.exec(head)
  return fromMeta ? fromMeta[1].toLowerCase() : 'utf-8'
}

function decode(bytes, contentType) {
  const label = charsetOf(contentType, bytes)
  try {
    return new TextDecoder(label === 'gb2312' ? 'gbk' : label).decode(bytes)
  } catch {
    return new TextDecoder('utf-8').decode(bytes)
  }
}

/** Read at most a fixed number of bytes from a response body; the rest is cancelled. */
async function readCapped(response, limit) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const all = new Uint8Array(await response.arrayBuffer())
    return { bytes: all.subarray(0, limit), clipped: all.length > limit }
  }
  const reader = response.body.getReader()
  const chunks = []
  let size = 0
  let clipped = false
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    if (!value || !value.length) continue
    if (size + value.length >= limit) {
      chunks.push(value.subarray(0, limit - size))
      size = limit
      clipped = true
      try { await reader.cancel() } catch { /* already closed */ }
      break
    }
    chunks.push(value)
    size += value.length
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return { bytes, clipped }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', middot: '·', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' }

export function htmlToText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|iframe|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(nav|footer|aside)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/?(p|div|section|article|li|tr|h[1-6]|blockquote|pre|br)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] || m)
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n').map((line) => line.trim()).join('\n')
    .trim()
}

/** Fetch a URL and return readable text plus a few facts about the response. */
export async function readPage(url, options = {}) {
  const target = /^https?:\/\//i.test(url) ? url : 'https://' + url
  const max = Math.min(Math.max(options.maxChars || 12000, 500), 40000)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  let response
  let current = target
  let usedCookie = false
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const parsed = await assertFetchable(current)
      const headers = {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      }
      if (parsed.protocol === 'https:') {
        const cookie = cookieFor(parsed.host)
        if (cookie) { headers.cookie = cookie; usedCookie = true }
      }
      response = await fetch(current, { headers, redirect: 'manual', signal: controller.signal })
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location) break
        current = new URL(location, current).toString()
        continue
      }
      break
    }
  } finally {
    clearTimeout(timer)
  }

  const { bytes, clipped } = await readCapped(response, MAX_BYTES)
  const contentType = response.headers.get('content-type') || ''
  const raw = decode(bytes, contentType)
  const isHtml = /html|xml/i.test(contentType) || /^\s*</.test(raw.slice(0, 200))
  const text = isHtml ? htmlToText(raw) : raw.trim()
  const titleHit = /<title[^>]*>([^<]*)<\/title>/i.exec(raw)
  const title = isHtml && titleHit ? titleHit[1] : ''
  const clippedText = text.length > max
  const body = clippedText ? text.slice(0, max) + '\n\n…[' + (text.length - max) + ' 字未显示]' : text

  return {
    url: response.url || current,
    status: response.status,
    title: title.trim(),
    chars: text.length,
    truncated: clippedText,
    byteLimitHit: clipped,
    text: body,
    loginWall: /登录后|请先登录|sign in to continue|log in to continue/i.test(raw.slice(0, 20000)) && !usedCookie,
  }
}

/** Read several pages with bounded concurrency; results keep the input order. */
export async function readPages(urls, options = {}) {
  const list = (Array.isArray(urls) ? urls : []).slice(0, 8)
  const results = new Array(list.length)
  let next = 0
  const worker = async () => {
    for (;;) {
      const index = next++
      if (index >= list.length) return
      const url = list[index]
      try {
        results[index] = await readPage(url, options)
      } catch (error) {
        results[index] = { url, error: String((error && error.message) || error) }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, list.length) }, worker))
  return results
}

/** Wikipedia plain-text extract for a title or search term. */
export async function wikiExtract(query, lang = 'zh', maxChars = 6000) {
  const base = 'https://' + lang + '.wikipedia.org/w/api.php'
  const find = new URLSearchParams({ action: 'query', list: 'search', srsearch: query, srlimit: '1', format: 'json' })
  let found
  try {
    found = await (await fetch(base + '?' + find, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) })).json()
  } catch (error) {
    return { found: false, query, lang, reason: '维基百科不可达：' + String(error.message || error) }
  }
  const hit = found && found.query && found.query.search && found.query.search[0]
  if (!hit) return { found: false, query, lang }
  const get = new URLSearchParams({ action: 'query', prop: 'extracts', explaintext: '1', redirects: '1', format: 'json', titles: hit.title })
  let page
  try {
    page = await (await fetch(base + '?' + get, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) })).json()
  } catch (error) {
    return { found: false, query, lang, reason: '维基百科不可达：' + String(error.message || error) }
  }
  const pages = (page && page.query && page.query.pages) || {}
  const first = pages[Object.keys(pages)[0]] || {}
  const text = String(first.extract || '')
  return {
    found: Boolean(text),
    query,
    title: first.title || hit.title,
    url: 'https://' + lang + '.wikipedia.org/wiki/' + encodeURIComponent(String(first.title || hit.title).replace(/ /g, '_')),
    chars: text.length,
    text: text.length > maxChars ? text.slice(0, maxChars) + '…' : text,
  }
}

/** Remove SRT timing lines and join subtitles into sentences. */
export function srtToText(raw) {
  const lines = raw.replace(/\r/g, '').split('\n')
  const kept = []
  for (const line of lines) {
    const s = line.trim()
    if (!s) continue
    if (/^\d+$/.test(s)) continue
    if (/-->/.test(s)) continue
    if (kept.length && kept[kept.length - 1] === s) continue
    kept.push(s)
  }
  return kept.join('').replace(/([。？！?!])(?=[^\s])/g, '$1\n').trim()
}

/** Decode a text file: UTF-8 first, then GBK for older subtitle files. */
export function readTextFile(path) {
  const bytes = readFileSync(path)
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    try {
      return new TextDecoder('gbk').decode(bytes)
    } catch {
      return new TextDecoder('utf-8').decode(bytes)
    }
  }
}

/** Transcript for a Bilibili video id, from the local subtitle corpus. */
export function bilibiliTranscript(bvid, subsDir, maxChars = 12000) {
  const dir = subsDir || ''
  if (!dir || !existsSync(dir)) return { found: false, reason: 'subsDir 未配置或不存在', bvid }
  const id = String(bvid).toUpperCase()
  const file = readdirSync(dir).filter((n) => n.toUpperCase().includes(id) && /\.(srt|txt)$/i.test(n))[0]
  if (!file) return { found: false, reason: '本地字幕库没有这个视频', bvid, dir }
  const raw = readTextFile(join(dir, file))
  const text = /\.srt$/i.test(file) ? srtToText(raw) : raw
  return {
    found: true,
    bvid: id,
    file,
    chars: text.length,
    text: text.length > maxChars ? text.slice(0, maxChars) + '…' : text,
  }
}
