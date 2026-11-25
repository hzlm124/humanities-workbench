/**
 * Bilibili reads: description, CC subtitles, comments, columns and dynamics.
 * Everything runs through one tab on bilibili.com, so the profile's cookies,
 * buvid3 and referer are the browser's own; WBI signing happens in Node.
 */
import { createHash } from 'node:crypto'
import { pageSession } from './browser.mjs'

const API = 'https://api.bilibili.com'
const HOME = 'https://www.bilibili.com/'

const MIXIN_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61,
  26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36,
  20, 34, 44, 52,
]

const CODES = {
  '-101': '这个内容要登录才给看，先点「扫码登录」再试',
  '-352': '触发了风控校验，先打开一次 B 站首页再试',
  '-400': '请求参数不对',
  '-403': '没有权限看这个内容',
  '-404': '内容不存在或已删除',
  '-412': '请求被拦截，稍后再试',
  '-509': '请求太频繁，等一下再试',
}

const stem = (url) => String(url || '').split('?')[0].split('/').pop().split('.')[0]

/** The two WBI keys come from the nav payload, then get permuted into 32 chars. */
export function wbiMixin(navJson) {
  const data = (navJson && navJson.data) || {}
  const raw = stem(data.wbi_img && data.wbi_img.img_url) + stem(data.wbi_img && data.wbi_img.sub_url)
  if (raw.length < 64) return ''
  return MIXIN_TAB.map((index) => raw[index] || '').join('').slice(0, 32)
}

export function signQuery(params, mixin, now = Date.now()) {
  const merged = Object.assign({}, params, { wts: Math.floor(now / 1000) })
  const query = Object.keys(merged)
    .sort()
    .map((key) => {
      const value = String(merged[key] == null ? '' : merged[key]).replace(/[!'()*]/g, '')
      return encodeURIComponent(key) + '=' + encodeURIComponent(value)
    })
    .join('&')
  if (!mixin) return query
  const w_rid = createHash('md5').update(query + mixin).digest('hex')
  return query + '&w_rid=' + w_rid
}

export function parseJson(text) {
  const raw = String(text || '').replace(/^\uFEFF/, '').trim()
  if (!raw) throw new Error('页面返回空内容')
  const start = raw.search(/[\[{]/)
  if (start < 0) throw new Error('返回的不是 JSON：' + raw.slice(0, 80))
  try {
    return JSON.parse(raw.slice(start))
  } catch {
    throw new Error('JSON 解析失败：' + raw.slice(0, 80))
  }
}

export function apiError(json) {
  if (!json || typeof json !== 'object') return '返回内容为空'
  const code = Number(json.code)
  if (!code) return ''
  return CODES[String(code)] || String(json.message || ('接口返回 ' + code))
}

/** Accepts a BV id, an av id, a numeric id or any bilibili URL. */
export function parseId(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  const bv = text.match(/BV[0-9A-Za-z]{10}/)
  if (bv) return { kind: 'bvid', bvid: bv[0], value: bv[0] }
  const av = text.match(/av(\d+)/i)
  if (av) return { kind: 'aid', aid: Number(av[1]), value: av[1] }
  const cv = text.match(/read\/cv(\d+)|cv(\d+)/i)
  if (cv) return { kind: 'cvid', cvid: Number(cv[1] || cv[2]), value: String(cv[1] || cv[2]) }
  const mid = text.match(/space\.bilibili\.com\/(\d+)/)
  if (mid) return { kind: 'uid', uid: Number(mid[1]), value: mid[1] }
  const digits = text.match(/^\d+$/)
  if (digits) return { kind: 'number', value: text }
  return null
}

const iso = (seconds) => {
  const n = Number(seconds)
  return n > 0 ? new Date(n * 1000).toISOString() : ''
}

export function pickSubtitleList(json) {
  const subs = (((json || {}).data || {}).subtitle || {}).subtitles
  if (!Array.isArray(subs)) return []
  return subs.map((row) => {
    const url = String(row.subtitle_url || '')
    return {
      lan: String(row.lan || ''),
      label: String(row.lan_doc || row.lan || ''),
      ai: Boolean(row.ai_type),
      url: url.startsWith('//') ? 'https:' + url : url,
    }
  }).filter((row) => row.url)
}

export function parseSubtitle(json, cap = 24000) {
  const body = json && Array.isArray(json.body) ? json.body : []
  const captions = body.map((row) => ({
    from: Number(row.from) || 0,
    to: Number(row.to) || 0,
    text: String(row.content || '').replace(/\s+/g, ' ').trim(),
  })).filter((row) => row.text)
  const text = captions.map((row) => row.text).join('\n')
  return { lines: captions.length, captions, text: text.length > cap ? text.slice(0, cap) : text, truncated: text.length > cap }
}

export function pickComments(json, limit) {
  const data = (json || {}).data || {}
  const replies = Array.isArray(data.replies) ? data.replies : []
  const items = replies.slice(0, limit).map((row) => ({
    user: String(((row.member || {}).uname) || ''),
    like: Number(row.like) || 0,
    replies: Number(row.rcount) || 0,
    at: iso(row.ctime),
    text: String(((row.content || {}).message) || '').trim(),
  })).filter((row) => row.text)
  return {
    total: Number(((data.page || {}).count)) || items.length,
    items,
  }
}

export function pickDynamic(json, limit) {
  const items = (((json || {}).data || {}).items)
  if (!Array.isArray(items)) return { total: 0, items: [] }
  const rows = items.slice(0, limit).map((row) => {
    const modules = row.modules || {}
    const author = modules.module_author || {}
    const dynamic = modules.module_dynamic || {}
    const major = dynamic.major || {}
    const parts = [
      String((dynamic.desc || {}).text || ''),
      String((major.opus || {}).summary ? major.opus.summary.text || '' : ''),
      String((major.archive || {}).title || ''),
      String((major.archive || {}).desc || ''),
    ].filter(Boolean)
    return {
      id: String(row.id_str || ''),
      type: String(row.type || ''),
      at: iso(author.pub_ts),
      text: parts.join(' ').replace(/\s+/g, ' ').trim(),
      link: 'https://t.bilibili.com/' + String(row.id_str || ''),
    }
  }).filter((row) => row.text)
  return { total: rows.length, items: rows }
}

export function pickArticle(infoJson, fallback) {
  const data = (infoJson || {}).data || {}
  const stats = data.stats || {}
  return {
    title: String(data.title || (fallback && fallback.title) || ''),
    author: String(((data.author || {}).name) || data.name || ''),
    words: Number(data.words) || 0,
    views: Number(stats.view) || Number(data.view) || 0,
    likes: Number(stats.like) || Number(data.like) || 0,
    at: iso(data.publish_time || data.ctime || data.pub_time),
  }
}
const clip = (value, max) => {
  const text = String(value || '')
  return { text: text.length > max ? text.slice(0, max) : text, truncated: text.length > max }
}

async function jsonOf(page, url, settle) {
  return parseJson(await page.read(url, settle))
}

function withSign(path, params, mixin) {
  return API + path + '?' + signQuery(params, mixin || '')
}

/**
 * Read one kind of bilibili content. `kind` is video, subtitle, comments,
 * article or dynamic; `id` is a BV/av/cv number, a URL or a space uid.
 */
export async function collect(options = {}) {
  const kind = String(options.kind || 'video').toLowerCase()
  const limit = Math.min(Math.max(Number(options.limit) || 10, 1), 40)
  const parsed = parseId(options.id)
  if (!parsed) return { ok: false, error: '需要一个 BV 号、aid、cv 号、空间 uid 或对应链接' }
  const numeric = parsed.kind === 'number' ? Number(parsed.value) : 0
  if (kind === 'article' && parsed.kind !== 'cvid' && !numeric) return { ok: false, error: '专栏要 cv 号，例如 cv123456' }
  if (kind === 'dynamic' && parsed.kind !== 'uid' && !numeric) return { ok: false, error: '动态要空间 uid，例如 12345678' }

  const session = await pageSession(HOME, async (page) => {
    const nav = await jsonOf(page, API + '/x/web-interface/nav', 300)
    const mixin = wbiMixin(nav)
    const loggedIn = Boolean(nav && nav.data && nav.data.isLogin)
    const need = (json) => { const bad = apiError(json); if (bad) throw new Error(bad) }

    if (kind === 'video') {
      const json = await jsonOf(page, withSign('/x/web-interface/view', parsed.bvid ? { bvid: parsed.bvid } : { aid: parsed.aid || numeric }, ''))
      need(json)
      const v = json.data || {}
      const desc = clip(v.desc, 8000)
      return {
        kind, loggedIn,
        bvid: String(v.bvid || ''), aid: Number(v.aid) || 0, cid: Number(v.cid) || 0,
        title: String(v.title || ''), desc: desc.text, descTruncated: desc.truncated,
        owner: String(((v.owner || {}).name) || ''),
        durationSec: Number(v.duration) || 0, publishedAt: iso(v.pubdate),
        stat: {
          view: Number(((v.stat || {}).view)) || 0,
          danmaku: Number(((v.stat || {}).danmaku)) || 0,
          reply: Number(((v.stat || {}).reply)) || 0,
          like: Number(((v.stat || {}).like)) || 0,
          coin: Number(((v.stat || {}).coin)) || 0,
          favorite: Number(((v.stat || {}).favorite)) || 0,
          share: Number(((v.stat || {}).share)) || 0,
        },
      }
    }

    if (kind === 'subtitle') {
      const view = await jsonOf(page, withSign('/x/web-interface/view', parsed.bvid ? { bvid: parsed.bvid } : { aid: parsed.aid || numeric }, ''))
      need(view)
      const v = view.data || {}
      const player = await jsonOf(page, withSign('/x/player/wbi/v2', { bvid: v.bvid, cid: v.cid }, mixin), 500)
      const list = pickSubtitleList(player)
      if (!list.length) {
        return {
          kind, loggedIn, bvid: v.bvid, cid: v.cid, language: '', subtitles: [], lines: 0, captions: [], text: '',
          note: loggedIn ? '这个视频没有 CC 字幕' : '字幕列表要登录后才下发，先点「扫码登录」',
        }
      }
      const picked = list.filter((row) => /^zh|ai-zh/i.test(row.lan))[0] || list[0]
      const body = parseSubtitle(parseJson(await page.read(picked.url, 300)))
      return {
        kind, loggedIn, bvid: v.bvid, cid: v.cid, title: String(v.title || ''),
        language: picked.label, subtitles: list,
        lines: body.lines, captions: body.captions.slice(0, 400), text: body.text, truncated: body.truncated,
      }
    }

    if (kind === 'comments') {
      const view = await jsonOf(page, withSign('/x/web-interface/view', parsed.bvid ? { bvid: parsed.bvid } : { aid: parsed.aid || numeric }, ''))
      need(view)
      const v = view.data || {}
      const sort = String(options.sort || 'hot') === 'time' ? 0 : 2
      const query = { type: 1, oid: v.aid, pn: 1, ps: limit, sort }
      let json = await jsonOf(page, withSign('/x/v2/reply', query, ''), 500)
      if (apiError(json)) json = await jsonOf(page, withSign('/x/v2/reply/wbi/main', { oid: v.aid, type: 1, mode: sort ? 3 : 2, next: 0, ps: limit }, mixin), 600)
      need(json)
      const rows = pickComments(json, limit)
      return { kind, loggedIn, bvid: v.bvid, title: String(v.title || ''), total: rows.total, items: rows.items }
    }

    if (kind === 'dynamic') {
      const uid = parsed.uid || numeric
      let json = await jsonOf(page, withSign('/x/polymer/web-dynamic/v1/feed/space', { host_mid: uid, features: 'itemOpusStyle' }, mixin), 700)
      if (apiError(json)) json = await jsonOf(page, withSign('/x/polymer/web-dynamic/v1/feed/space', { host_mid: uid }, ''), 700)
      need(json)
      const rows = pickDynamic(json, limit)
      return { kind, loggedIn, uid: parsed.uid, total: rows.total, items: rows.items }
    }

    const info = await jsonOf(page, withSign('/x/article/viewinfo', { id: numeric || parsed.cvid }, ''), 500)
    need(info)
    const meta = pickArticle(info, { title: '' })
    const cvid = numeric || parsed.cvid
    await page.read('https://www.bilibili.com/read/cv' + cvid, 3600)
    const raw = await page.evaluate('document.body ? String(document.body.innerText || "") : ""')
    // The reader page renders inside custom elements with no stable class, but the
    // title is known from viewinfo, so the article starts there.
    const whole = String(raw || '')
    const at = meta.title ? whole.indexOf(meta.title) : -1
    const body = at > 0 ? whole.slice(at) : whole
    const text = clip(body, 24000)
    return { kind: 'article', loggedIn, cvid, ...meta, text: text.text, truncated: text.truncated }
  }, { wait: 1200 })

  if (!session.ok) return { ok: false, error: session.error }
  return { ok: true, ...session.value, browser: session.browser }
}
