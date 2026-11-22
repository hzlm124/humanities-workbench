/**
 * Reader tools: page text, Wikipedia extracts, Bilibili transcripts.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const COOKIES = join(homedir(), '.dsh', 'humanities-workbench', 'cookies.json')

/** Cookie header for a host, from an optional cookies.json keyed by host suffix. */
export function cookieFor(host) {
  try {
    const map = JSON.parse(readFileSync(COOKIES, 'utf8'))
    for (const key of Object.keys(map)) {
      if (host === key || host.endsWith('.' + key) || host === 'www.' + key) return map[key]
    }
  } catch { /* no cookie file is normal */ }
  return ''
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
  const headers = { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5', 'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8' }
  const host = new URL(target).host
  const cookie = cookieFor(host)
  if (cookie) headers.cookie = cookie

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  let response
  try {
    response = await fetch(target, { headers, redirect: 'follow', signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') || ''
  const raw = decode(bytes, contentType)
  const isHtml = /html|xml/i.test(contentType) || /^\s*</.test(raw.slice(0, 200))
  const text = isHtml ? htmlToText(raw) : raw.trim()
  const titleHit = /<title[^>]*>([^<]*)<\/title>/i.exec(raw)
  const title = isHtml && titleHit ? titleHit[1] : ''
  const clipped = text.length > max
  const body = clipped ? text.slice(0, max) + '\n\n…[' + (text.length - max) + ' 字未显示]' : text

  return {
    url: response.url || target,
    status: response.status,
    title: title.trim(),
    chars: text.length,
    truncated: clipped,
    text: body,
    loginWall: /登录后|请先登录|sign in to continue|log in to continue/i.test(raw.slice(0, 20000)) && !cookie,
  }
}

/** Read several pages with bounded concurrency; never rejects a single URL. */
export async function readPages(urls, options = {}) {
  const list = (Array.isArray(urls) ? urls : []).slice(0, 8)
  const out = []
  const queue = list.slice()
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift()
      try {
        out.push(await readPage(url, options))
      } catch (error) {
        out.push({ url, error: String((error && error.message) || error) })
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, list.length) }, worker))
  return out
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

/** Transcript for a Bilibili video id, from the local subtitle corpus. */
export function bilibiliTranscript(bvid, subsDir, maxChars = 12000) {
  const dir = subsDir || ''
  if (!dir || !existsSync(dir)) return { found: false, reason: 'subsDir 未配置或不存在', bvid }
  const id = String(bvid).toUpperCase()
  const file = readdirSync(dir).filter((n) => n.toUpperCase().includes(id) && /\.(srt|txt)$/i.test(n))[0]
  if (!file) return { found: false, reason: '本地字幕库没有这个视频', bvid, dir }
  const raw = readFileSync(join(dir, file), 'utf8')
  const text = /\.srt$/i.test(file) ? srtToText(raw) : raw
  return {
    found: true,
    bvid: id,
    file,
    chars: text.length,
    text: text.length > maxChars ? text.slice(0, maxChars) + '…' : text,
  }
}
