/**
 * Logged-in reading: a private browser profile driven over the DevTools protocol.
 * The user's everyday browser is never touched; this profile only ever holds
 * the logins the user chose to give it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { spawn, spawnSync } from 'node:child_process'
import { assertFetchable, isPrivateIp } from './tools.mjs'

export const PROFILE_DIR = join(homedir(), '.dsh', 'humanities-workbench', 'browser')
const DEFAULT_PORT = 9411
const MARKER = '.hw-mode'
const PID_FILE = '.hw.pid'
const LOGIN_FILE = join(homedir(), '.dsh', 'humanities-workbench', 'logins.json')

const loginPath = () => process.env.HW_LOGIN_FILE || LOGIN_FILE

/** Sites with a known shape. Each entry is a starting point, never a promise. */
export const SITES = {
  x: {
    name: 'X',
    url: 'https://x.com/',
    loginUrl: 'https://x.com/i/flow/login',
    hosts: ['x.com', 'twitter.com'],
    items: ['[data-testid="tweetText"]', 'article div[lang]'],
    loginSelectors: ['[data-testid="loginButton"]', 'a[href="/i/flow/login"]'],
  },
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com/',
    loginUrl: 'https://accounts.google.com/ServiceLogin?service=youtube',
    hosts: ['youtube.com', 'youtu.be'],
    items: ['#description-inline-expander', 'ytd-comment-thread-renderer #content-text', '#content-text'],
    loginSelectors: ['a[href*="accounts.google.com/ServiceLogin"]', 'ytd-consent-bump-v2-lightbox'],
  },
  bilibili: {
    name: 'B站',
    url: 'https://www.bilibili.com/',
    loginUrl: 'https://passport.bilibili.com/login',
    hosts: ['bilibili.com', 'b23.tv'],
    items: ['.reply-item .reply-content', '.reply-content', '.desc-info-text', '.video-desc-container'],
    loginSelectors: ['.bili-login-card', '.login-tip', '.fixed-card .login-btn'],
  },
  zhihu: {
    name: '知乎',
    url: 'https://www.zhihu.com/',
    loginUrl: 'https://www.zhihu.com/signin?next=%2F',
    hosts: ['zhihu.com'],
    items: ['.RichText', '.Post-RichText', '.CommentContent'],
    loginSelectors: ['.Modal-wrapper', '.signFlow', '.Login-button', '.Button--blue'],
  },
  weibo: {
    name: '微博',
    url: 'https://weibo.com/',
    loginUrl: 'https://passport.weibo.com/sso/signin',
    hosts: ['weibo.com', 'weibo.cn'],
    items: ['.detail_wbtext', '.comment-content', '.WB_text', '.Feed_wrap'],
    loginSelectors: ['.LoginCard', '.login-form', '.W_login_form'],
  },
  douban: {
    name: '豆瓣',
    url: 'https://www.douban.com/',
    loginUrl: 'https://accounts.douban.com/passport/login',
    hosts: ['douban.com'],
    items: ['.review-content', '.comment-item .short', '#link-report .topic-content'],
    loginSelectors: ['.login-popup', 'a[href*="accounts.douban.com/passport/login"]'],
  },
  xiaohongshu: {
    name: '小红书',
    url: 'https://www.xiaohongshu.com/',
    loginUrl: 'https://www.xiaohongshu.com/login',
    hosts: ['xiaohongshu.com', 'xhslink.com'],
    items: ['#detail-desc', '.note-text', '.comment-item .content'],
    loginSelectors: ['.login-container', '.login-box', '.sign-in-container'],
  },
  ctext: {
    name: '中国哲学书电子化',
    url: 'https://ctext.org/zhs',
    loginUrl: 'https://ctext.org/account.pls',
    hosts: ['ctext.org'],
    items: ['.ctexttext', '.ctext'],
    loginSelectors: ['.login', 'input[name="email"]'],
  },
  wikisource: {
    name: '维基文库',
    url: 'https://zh.wikisource.org/wiki/Wikisource:%E9%A6%96%E9%A1%B5',
    loginUrl: 'https://zh.wikisource.org/wiki/Special:UserLogin',
    hosts: ['wikisource.org'],
    items: ['#mw-content-text .mw-parser-output', '.mw-parser-output p'],
    loginSelectors: ['.mw-ui-vform', '#userloginForm'],
  },
  archive: {
    name: 'Internet Archive',
    url: 'https://archive.org/',
    loginUrl: 'https://archive.org/account/login',
    hosts: ['archive.org'],
    items: ['.item-ttl', '#descript', '.metadata-definition'],
    loginSelectors: ['.login-form', 'form[action="/account/login"]'],
  },
  gallica: {
    name: 'Gallica 法国国家图书馆',
    url: 'https://gallica.bnf.fr/',
    login: false,
    hosts: ['gallica.bnf.fr'],
    items: ['.content', '#textContent', '.document'],
    loginSelectors: [],
  },
  persee: {
    name: 'Persée 法语期刊',
    url: 'https://www.persee.fr/',
    login: false,
    hosts: ['persee.fr'],
    items: ['.article__content', '#article', '.content'],
    loginSelectors: [],
  },
  ndl: {
    name: '日本国会图书馆',
    url: 'https://dl.ndl.go.jp/',
    login: false,
    hosts: ['dl.ndl.go.jp', 'ndl.go.jp'],
    items: ['.itemInfo', '#itemInfo', '.contents'],
    loginSelectors: [],
  },
}

const SITE_ORDER = ['x', 'youtube', 'bilibili', 'zhihu', 'weibo', 'douban', 'xiaohongshu', 'ctext', 'wikisource', 'archive', 'gallica', 'persee', 'ndl']

export const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

export function profileDir() {
  return process.env.HW_BROWSER_DIR || PROFILE_DIR
}

export function cdpPort() {
  const raw = Number(process.env.HW_CDP_PORT)
  return Number.isInteger(raw) && raw > 1024 && raw < 65536 ? raw : DEFAULT_PORT
}

const cdp = (path) => 'http://127.0.0.1:' + cdpPort() + path

/** Match a URL to a known site adapter, by host suffix. */
export function siteFor(url) {
  let host = ''
  try { host = new URL(/^[a-z]+:\/\//i.test(url) ? url : 'https://' + url).hostname.toLowerCase() } catch { return null }
  for (const id of SITE_ORDER) {
    const site = SITES[id]
    if (site.hosts.some((h) => host === h || host.endsWith('.' + h))) return { id, ...site }
  }
  return null
}

const BROWSERS = [
  ['Microsoft\\Edge\\Application\\msedge.exe', 'Edge'],
  ['Google\\Chrome\\Application\\chrome.exe', 'Chrome'],
]

/** Find an installed Chromium browser, preferring Edge. */
export function findBrowser() {
  const bases = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean)
  for (const [tail, name] of BROWSERS) {
    for (const base of bases) {
      const exe = join(base, tail)
      if (existsSync(exe)) return { exe, name }
    }
  }
  return null
}

async function probeVersion() {
  try {
    const res = await fetch(cdp('/json/version'), { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return null
    const body = await res.json()
    return { version: String(body.Browser || ''), wsUrl: String(body.webSocketDebuggerUrl || '') }
  } catch {
    return null
  }
}

async function pageTargets() {
  try {
    const res = await fetch(cdp('/json/list'), { signal: AbortSignal.timeout(1500) })
    const list = await res.json()
    return Array.isArray(list) ? list.filter((row) => row && row.type === 'page' && row.webSocketDebuggerUrl) : []
  } catch {
    return []
  }
}

function readPid() {
  try { return Number(readFileSync(join(profileDir(), PID_FILE), 'utf8').trim()) || 0 } catch { return 0 }
}

/** A stored pid is only trusted when the process is still a browser. */
function pidIsBrowser(pid) {
  if (!pid) return false
  try {
    const out = spawnSync('tasklist', ['/FI', 'PID eq ' + pid, '/FO', 'CSV', '/NH'], { encoding: 'utf8', windowsHide: true, timeout: 5000 })
    return /msedge|chrome/i.test(String(out.stdout || ''))
  } catch {
    return false
  }
}

function markerValue() {
  try { return readFileSync(join(profileDir(), MARKER), 'utf8').trim() } catch { return '' }
}

/** Last per-site login check, as written by probeLogins. */
export function readLogins() {
  try {
    const parsed = JSON.parse(readFileSync(loginPath(), 'utf8'))
    if (!parsed || !Array.isArray(parsed.sites)) return { checkedAt: '', sites: [] }
    return { checkedAt: String(parsed.checkedAt || ''), sites: parsed.sites }
  } catch {
    return { checkedAt: '', sites: [] }
  }
}

export function writeLogins(value) {
  try {
    mkdirSync(dirname(loginPath()), { recursive: true })
    writeFileSync(loginPath(), JSON.stringify(value, null, 2) + '\n', 'utf8')
    return true
  } catch {
    return false
  }
}

/**
 * Open every known site once and record whether a login wall shows. One site at
 * a time on purpose: the profile can only load so fast, and a clear failure is
 * worth more than a fast wrong answer.
 */
export async function probeLogins() {
  const started = await ensureBrowser({ headed: false })
  if (!started.ok) return { ok: false, error: started.reason, checkedAt: '', sites: [] }
  const rows = []
  for (const id of SITE_ORDER) {
    const site = SITES[id]
    const row = { id, name: site.name, url: site.url, loginWall: null, title: '', error: '', login: site.login !== false }
    if (site.login === false) {
      row.loginWall = false
      row.title = site.name
      row.note = '公开可读，不需要登录'
      rows.push(row)
      continue
    }
    let picked = null
    try {
      picked = await grabTarget({ fresh: true })
      if (!picked) throw new Error('没有可用的页面目标')
      const socket = await openSocket(picked.target.webSocketDebuggerUrl, 8000)
      client = makeClient(socket)
      await navigate(client, site.url, 2200)
      const check = { maxChars: 200, items: [], loginSelectors: site.loginSelectors }
      const state = await evaluate(client, '(' + extractInPage.toString() + ')(' + JSON.stringify(check) + ')')
      row.loginWall = state ? Boolean(state.loginWall) : null
      row.title = state ? String(state.title || '') : ''
    } catch (error) {
      row.error = String((error && error.message) || error)
    } finally {
      if (client) client.close()
      if (picked && picked.created) await closeTarget(picked.target.id)
    }
    rows.push(row)
  }
  const result = { ok: true, checkedAt: new Date().toISOString(), sites: rows }
  writeLogins(result)
  return result
}

/** What the panel and the tools report about the private profile. */
export async function browserStatus() {
  const alive = await probeVersion()
  const profile = profileDir()
  const found = findBrowser()
  const logins = readLogins()
  const knownSite = new Map((logins.sites || []).map((row) => [String(row.id), row]))
  let targets = 0
  if (alive) targets = (await pageTargets()).length
  let lastUsed = ''
  if (existsSync(profile)) { try { lastUsed = statSync(profile).mtime.toISOString() } catch { lastUsed = '' } }
  return {
    running: Boolean(alive),
    version: alive ? alive.version : '',
    mode: markerValue(),
    port: cdpPort(),
    targets,
    profile: { dir: profile, exists: existsSync(profile), lastUsed },
    browser: found ? found.name : '',
    loginCheckedAt: logins.checkedAt,
    sites: SITE_ORDER.map((id) => {
      const known = knownSite.get(id) || {}
      return {
        id, name: SITES[id].name, url: SITES[id].url,
        login: SITES[id].login !== false,
        loginWall: typeof known.loginWall === 'boolean' ? known.loginWall : null,
        title: known.title || '',
        note: known.note || '',
        error: known.error || '',
      }
    }),
  }
}

async function waitFor(check, timeoutMs, stepMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await check()) return true
    await sleep(stepMs || 300)
  }
  return false
}

export async function shutdown() {
  const version = await probeVersion()
  if (version && version.wsUrl) {
    try {
      const socket = await openSocket(version.wsUrl, 3000)
      const client = makeClient(socket)
      client.send('Browser.close', {}, 3000).catch(() => {})
      await sleep(400)
      client.close()
    } catch { /* fall through to the pid path */ }
  }
  const gone = await waitFor(async () => !(await probeVersion()), 5000, 300)
  if (!gone) {
    const pid = readPid()
    if (pidIsBrowser(pid)) {
      try { spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }) } catch { /* already gone */ }
      await waitFor(async () => !(await probeVersion()), 5000, 300)
    }
  }
  try { rmSync(join(profileDir(), PID_FILE), { force: true }) } catch { /* nothing to clean */ }
  return { running: Boolean(await probeVersion()) }
}

/**
 * Start the private browser when it is not already up. Headed is only used for
 * a login, because a visible window is the whole point of that step.
 */
async function startBrowser(options = {}) {
  const want = options.headed ? 'headed' : 'headless'
  const live = await probeVersion()
  if (live) {
    const mode = markerValue()
    if (want === 'headed' && mode === 'headless') {
      await shutdown()
    } else {
      return { ok: true, reused: true, mode, version: live.version }
    }
  }
  const found = findBrowser()
  if (!found) return { ok: false, reason: '没有找到 Edge 或 Chrome，装一个再来' }
  const profile = profileDir()
  try {
    mkdirSync(profile, { recursive: true })
    writeFileSync(join(profile, MARKER), want, 'utf8')
  } catch (error) {
    return { ok: false, reason: '配置目录不可写：' + String((error && error.message) || error) }
  }
  const args = [
    '--remote-debugging-port=' + cdpPort(),
    '--user-data-dir=' + profile,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-features=Translate,OptimizationHints,MediaRouter',
  ]
  if (want === 'headless') args.push('--headless=new', '--window-size=1280,900')
  args.push('about:blank')
  let child
  try {
    child = spawn(found.exe, args, { detached: true, stdio: 'ignore', windowsHide: want === 'headless' })
    child.unref()
  } catch (error) {
    return { ok: false, reason: '启动失败：' + String((error && error.message) || error) }
  }
  try { writeFileSync(join(profile, PID_FILE), String(child.pid || 0), 'utf8') } catch { /* best effort */ }
  const up = await waitFor(async () => Boolean(await probeVersion()), 15000, 400)
  if (!up) {
    return { ok: false, reason: '浏览器没有在 15 秒内开出调试口，可能被另一个实例占着同一个配置目录' }
  }
  const info = await probeVersion()
  return { ok: true, reused: false, mode: want, version: info ? info.version : '', browser: found.name }
}

/** One start at a time: two callers must not race for the same profile. */
let starting = null

export function ensureBrowser(options = {}) {
  if (starting) return starting
  starting = startBrowser(options).finally(() => { starting = null })
  return starting
}

function openSocket(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    let socket
    try { socket = new WebSocket(url) } catch (error) { reject(error); return }
    const timer = setTimeout(() => {
      try { socket.close() } catch { /* closing */ }
      reject(new Error('调试口连接超时'))
    }, timeoutMs || 8000)
    socket.onopen = () => { clearTimeout(timer); resolve(socket) }
    socket.onerror = () => { clearTimeout(timer); reject(new Error('调试口连接失败')) }
  })
}

function makeClient(socket) {
  let nextId = 1
  const pending = new Map()
  const listeners = new Set()
  socket.onmessage = (event) => {
    let message
    try { message = JSON.parse(String(event.data)) } catch { return }
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id)
      pending.delete(message.id)
      clearTimeout(entry.timer)
      if (message.error) entry.reject(new Error(message.error.message || '调试协议报错'))
      else entry.resolve(message.result)
      return
    }
    if (message.method) for (const fn of listeners) fn(message)
  }
  const send = (method, params, timeout) => new Promise((resolve, reject) => {
    const id = nextId++
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('页面没有响应：' + method))
    }, timeout || 25000)
    pending.set(id, { resolve, reject, timer })
    try {
      socket.send(JSON.stringify({ id, method, params: params || {} }))
    } catch (error) {
      clearTimeout(timer)
      pending.delete(id)
      reject(error)
    }
  })
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
  const close = () => { try { socket.close() } catch { /* closing */ } }
  return { send, on, close }
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result && result.exceptionDetails) {
    throw new Error(String((result.exceptionDetails.exception && result.exceptionDetails.exception.description) || result.exceptionDetails.text || '页面脚本出错'))
  }
  return result && result.result ? result.result.value : undefined
}

/** Runs inside the page. Kept as one function so no quoting layer can mangle it. */
function extractInPage(config) {
  const cap = config.maxChars || 12000
  const limit = config.itemLimit || 40
  const pick = (selectors) => {
    const out = []
    for (const selector of selectors) {
      let nodes = []
      try { nodes = Array.prototype.slice.call(document.querySelectorAll(selector)) } catch (error) { nodes = [] }
      for (const node of nodes) {
        if (out.length >= limit) break
        const text = String(node.innerText || node.textContent || '').trim()
        if (text) out.push(text.replace(/\n{3,}/g, '\n\n'))
      }
      if (out.length >= limit) break
    }
    return out
  }
  const body = document.body ? String(document.body.innerText || '') : ''
  const candidates = ['article', 'main', '[role=main]', '#js_content', '.article-content', '.post-content']
  let main = ''
  for (const selector of candidates) {
    let node = null
    try { node = document.querySelector(selector) } catch (error) { node = null }
    const text = node ? String(node.innerText || '').trim() : ''
    if (text.length > main.length) main = text
  }
  if (!main) main = body
  let loginWall = false
  for (const selector of config.loginSelectors || []) {
    try { if (document.querySelector(selector)) { loginWall = true; break } } catch (error) { /* bad selector */ }
  }
  if (!loginWall) {
    loginWall = /登录后查看|请先登录|扫码登录|登录后继续|Sign in to continue|Log in to continue|You must be logged in/i.test(body.slice(0, 1500))
  }
  const linkLimit = config.linkLimit || 60
  const links = []
  const seenHref = new Set()
  for (const anchor of document.querySelectorAll('a[href]')) {
    if (links.length >= linkLimit) break
    const label = String(anchor.innerText || anchor.textContent || '').replace(/\s+/g, ' ').trim()
    const href = String(anchor.href || '')
    if (!label || label.length < 2 || !/^https?:/i.test(href)) continue
    if (seenHref.has(href)) continue
    seenHref.add(href)
    links.push({ text: label.slice(0, 120), href: href.slice(0, 400) })
  }
  return {
    title: String(document.title || ''),
    url: String(location.href),
    bodyChars: body.length,
    main: main.slice(0, cap),
    links,
    items: pick(config.items || []).map((text) => text.slice(0, 2000)),
    loginWall,
  }
}

async function navigate(client, url, settleMs) {
  await client.send('Page.enable')
  let loaded = false
  const off = client.on((message) => { if (message.method === 'Page.loadEventFired') loaded = true })
  const result = await client.send('Page.navigate', { url })
  if (result && result.errorText) {
    off()
    throw new Error('打不开这个地址：' + result.errorText)
  }
  const deadline = Date.now() + 30000
  while (!loaded && Date.now() < deadline) await sleep(150)
  off()
  await sleep(settleMs)
  return Boolean(loaded)
}

async function createTarget() {
  for (const method of ['PUT', 'GET']) {
    try {
      const res = await fetch(cdp('/json/new?about:blank'), { method, signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        const made = await res.json()
        if (made && made.webSocketDebuggerUrl) return made
      }
    } catch { /* try the next method */ }
  }
  return null
}

async function closeTarget(id) {
  if (!id) return
  try { await fetch(cdp('/json/close/' + id), { signal: AbortSignal.timeout(2000) }) } catch { /* already gone */ }
}

const BLANK = (row) => !row.url || row.url === 'about:blank' || row.url === 'chrome://newtab/'

/**
 * Pick a tab for this call. `fresh` prefers a tab of its own so a reading never
 * navigates away from whatever the user has open; the caller closes what it made.
 */
async function grabTarget(options = {}) {
  const pages = await pageTargets()
  if (options.fresh) {
    const made = await createTarget()
    if (made) return { target: made, created: true }
  }
  const blank = pages.filter(BLANK)
  if (blank.length) return { target: blank[0], created: false }
  if (!options.fresh && pages.length) return { target: pages[0], created: false }
  if (options.fresh && pages.length) return { target: pages[0], created: false }
  const made = pages.length ? null : await createTarget()
  return made ? { target: made, created: true } : null
}

/** True for addresses a reading must never deliver content from. */
export function isPrivateTarget(url) {
  let host = ''
  try { host = new URL(url).hostname.replace(/^\[|\]$/g, '').toLowerCase() } catch { return false }
  if (!host) return false
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) return true
  return isPrivateIp(host)
}

/**
 * Open one address in the private profile and return readable text.
 * A bad address throws; a page-level failure comes back in `error`.
 */
export async function browse(url, options = {}) {
  const target = /^https?:\/\//i.test(String(url)) ? String(url) : 'https://' + String(url)
  if (!options.testAllowLocal) await assertFetchable(target)
  const site = siteFor(target)
  const started = await ensureBrowser({ headed: Boolean(options.headed) })
  if (!started.ok) return { ok: false, url: target, error: started.reason }
  const picked = await grabTarget({ fresh: true })
  if (!picked) return { ok: false, url: target, error: '调试口没有可用的页面目标' }
  const page = picked.target
  const maxChars = Math.min(Math.max(Number(options.maxChars) || 12000, 500), 40000)
  const scroll = Math.min(Math.max(Number(options.scroll) || 0, 0), 8)
  let socket
  try {
    socket = await openSocket(page.webSocketDebuggerUrl, 8000)
  } catch (error) {
    return { ok: false, url: target, error: String((error && error.message) || error) }
  }
  const client = makeClient(socket)
  try {
    const settle = Math.min(Math.max(Number(options.wait) || (site ? 2500 : 1200), 200), 15000)
    const loaded = await navigate(client, target, settle)
    const landed = String((await evaluate(client, 'location.href')) || '')
    if (!options.testAllowLocal && isPrivateTarget(landed)) {
      return { ok: false, url: landed, error: '页面落到了内网地址，已拒绝返回内容：' + landed }
    }
    for (let step = 0; step < scroll; step++) {
      await evaluate(client, 'window.scrollBy(0, Math.max(window.innerHeight, 800)); 1')
      await sleep(700)
    }
    if (scroll) await sleep(600)
    const custom = (Array.isArray(options.items) ? options.items : [])
      .map((row) => String(row || '').trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 6)
    const config = {
      maxChars,
      itemLimit: Math.min(Math.max(Number(options.itemLimit) || 40, 1), 120),
      items: custom.length ? custom : (site ? site.items : []),
      loginSelectors: site ? site.loginSelectors : [],
      linkLimit: Math.min(Math.max(Number(options.linkLimit) || 80, 0), 200),
    }
    const expression = '(' + extractInPage.toString() + ')(' + JSON.stringify(config) + ')'
    const pageData = await evaluate(client, expression)
    if (!pageData) return { ok: false, url: target, error: '页面没有返回可读内容' }
    if (!options.testAllowLocal && isPrivateTarget(pageData.url)) {
      return { ok: false, url: pageData.url, error: '页面落到了内网地址，已拒绝返回内容：' + pageData.url }
    }
    return {
      ok: true,
      url: pageData.url || target,
      title: pageData.title,
      site: site ? site.id : '',
      siteName: site ? site.name : '',
      loaded,
      loginWall: Boolean(pageData.loginWall),
      bodyChars: pageData.bodyChars,
      chars: pageData.main.length,
      text: pageData.main,
      items: pageData.items,
      itemCount: pageData.items.length,
      links: pageData.links || [],
      browser: { mode: started.mode, reused: Boolean(started.reused), port: cdpPort() },
    }
  } catch (error) {
    return { ok: false, url: target, error: String((error && error.message) || error) }
  } finally {
    client.close()
    if (picked.created) await closeTarget(page.id)
  }
}

/**
 * Open one tab on a site's own origin and hand the caller a reader. Reading a
 * URL means navigating to it and taking the document text, so an API answer
 * arrives as JSON with the profile's own cookies and no CORS layer between.
 */
export async function pageSession(home, fn, options = {}) {
  const started = await ensureBrowser({ headed: Boolean(options.headed) })
  if (!started.ok) return { ok: false, error: started.reason }
  const picked = await grabTarget({ fresh: true })
  if (!picked) return { ok: false, error: '调试口没有可用的页面目标' }
  const page = picked.target
  let socket
  try {
    socket = await openSocket(page.webSocketDebuggerUrl, 8000)
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) }
  }
  const client = makeClient(socket)
  const read = async (url, settle) => {
    await navigate(client, url, Math.min(Math.max(Number(settle) || 400, 100), 5000))
    const text = await evaluate(client, 'document.body ? String(document.body.innerText || "") : ""')
    return String(text || '')
  }
  try {
    if (home) await navigate(client, home, Math.min(Math.max(Number(options.wait) || 1500, 200), 15000))
    const value = await fn({ read, evaluate: (expression) => evaluate(client, expression) })
    return { ok: true, value, browser: { mode: started.mode, reused: Boolean(started.reused), port: cdpPort() } }
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) }
  } finally {
    client.close()
    if (picked.created) await closeTarget(page.id)
  }
}

/** Open a visible window on a site so the user can log in once. */
export async function openLogin(siteId) {
  const id = String(siteId || '').trim().toLowerCase()
  const site = SITES[id]
  if (!site) return { ok: false, error: '不认识的站点：' + siteId + '；可选 ' + SITE_ORDER.join(' / ') }
  if (site.login === false) {
    return { ok: true, site: id, name: site.name, url: site.url, login: false, loginWall: false, note: '这个站点公开可读，不需要登录。' }
  }
  const started = await ensureBrowser({ headed: true })
  if (!started.ok) return { ok: false, error: started.reason }
  const picked = await grabTarget()
  if (!picked) return { ok: false, error: '调试口没有可用的页面目标' }
  const page = picked.target
  let socket
  try {
    socket = await openSocket(page.webSocketDebuggerUrl, 8000)
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) }
  }
  const client = makeClient(socket)
  try {
    await navigate(client, site.loginUrl || site.url, 2500)
    lastLogin = { site: id, targetId: page.id, at: Date.now() }
    const check = {
      maxChars: 400,
      items: ['[data-testid="SideNav_AccountSwitcher_Button"]', 'a[href*="member"], a[href*="space"], a[href*="mine"]'],
      loginSelectors: site.loginSelectors,
    }
    const state = await evaluate(client, '(' + extractInPage.toString() + ')(' + JSON.stringify(check) + ')')
    return {
      ok: true,
      site: id,
      name: site.name,
      url: site.url,
      mode: started.mode,
      loginWall: state ? Boolean(state.loginWall) : null,
      title: state ? state.title : '',
      note: '窗口已打开，页面上有二维码就扫码登录。登录一次够用，之后抓取在后台复用这份状态；扫完回到面板会自动确认。',
    }
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) }
  } finally {
    client.close()
  }
}

/** Last tab a login opened, so the panel can keep watching that same page. */
let lastLogin = null

/** Merge one site's login result into logins.json without losing the others. */
function rememberLogin(id, loginWall, checkedAt) {
  const site = SITES[id]
  if (!site) return
  const current = readLogins()
  const rows = (current.sites || []).filter((row) => row && row.id !== id)
  rows.push({ id, name: site.name, url: site.url, loginWall, title: '', error: '' })
  rows.sort((a, b) => SITE_ORDER.indexOf(a.id) - SITE_ORDER.indexOf(b.id))
  writeLogins({ ok: true, checkedAt: checkedAt || new Date().toISOString(), sites: rows })
}

/**
 * Watch the window a login opened until the wall goes away or time runs out.
 * A scan on the phone therefore flips the panel by itself, without a second click.
 */
export async function waitForLogin(siteId, options) {
  const o = options || {}
  const id = String(siteId || '').trim().toLowerCase()
  const site = SITES[id]
  if (!site) return { ok: false, error: '不认识的站点：' + siteId }
  const timeout = Math.min(Math.max(Number(o.timeoutMs) || 25000, 3000), 90000)
  const started = await ensureBrowser({ headed: true })
  if (!started.ok) return { ok: false, site: id, error: started.reason }
  const pages = await pageTargets()
  const onSite = (row) => {
    const host = hostOf(row.url)
    return Boolean(host) && site.hosts.some((h) => host === h || host.endsWith('.' + h))
  }
  const remembered = lastLogin && lastLogin.site === id ? pages.find((row) => row.id === lastLogin.targetId) : null
  const page = remembered || pages.find(onSite) || null
  if (!page) return { ok: false, site: id, error: '没有打开的登录页，先点「登录」' }
  let socket
  try {
    socket = await openSocket(page.webSocketDebuggerUrl, 8000)
  } catch (error) {
    return { ok: false, site: id, error: String((error && error.message) || error) }
  }
  const client = makeClient(socket)
  const began = Date.now()
  try {
    let loggedIn = false
    while (Date.now() - began < timeout) {
      const check = { maxChars: 200, items: [], loginSelectors: site.loginSelectors }
      const state = await evaluate(client, '(' + extractInPage.toString() + ')(' + JSON.stringify(check) + ')')
      if (state && state.loginWall === false) { loggedIn = true; break }
      await sleep(1200)
    }
    const checkedAt = new Date().toISOString()
    if (loggedIn) rememberLogin(id, false, checkedAt)
    return { ok: true, site: id, name: site.name, loggedIn, checkedAt, waitedMs: Date.now() - began }
  } catch (error) {
    return { ok: false, site: id, error: String((error && error.message) || error) }
  } finally {
    client.close()
  }
}

const SELFTEST_FILE = join(homedir(), '.dsh', 'humanities-workbench', 'selftest.json')

/** Last real read, so the panel can say whether grabbing works at all. */
export function readSelfTest() {
  try { return JSON.parse(readFileSync(SELFTEST_FILE, 'utf8')) } catch { return null }
}

function writeSelfTest(row) {
  try {
    mkdirSync(dirname(SELFTEST_FILE), { recursive: true })
    writeFileSync(SELFTEST_FILE, JSON.stringify(row, null, 2) + '\n', 'utf8')
  } catch { /* a read-only home should not break the report */ }
}

/**
 * Read one ordinary page for real and report what came back. A green lamp only
 * proves the debugging port answered; this proves content arrives.
 */
export async function selfTest() {
  const began = Date.now()
  let result = null
  for (const url of ['https://example.com/', 'https://www.bing.com/']) {
    try {
      result = await browse(url, { maxChars: 3000, wait: 1200 })
    } catch (error) {
      result = { ok: false, error: String((error && error.message) || error) }
    }
    if (result && result.ok && String(result.text || '').length >= 40) break
  }
  const row = {
    at: new Date().toISOString(),
    ok: Boolean(result && result.ok && String(result.text || '').length >= 40),
    url: (result && result.url) || '',
    title: (result && result.title) || '',
    chars: result && result.text ? String(result.text).length : 0,
    ms: Date.now() - began,
    error: (result && result.error) || '',
  }
  writeSelfTest(row)
  return row
}

const hostOf = (url) => {
  try { return new URL(String(url)).hostname.toLowerCase() } catch { return '' }
}

/** Search pages, one adapter each: which site, which items, which links to keep. */
const ENGINES = {
  bing: {
    url: (q) => 'https://www.bing.com/search?q=' + encodeURIComponent(q),
    items: ['li.b_algo', 'li.b_algo h2'],
    keep: 'external',
    hosts: ['bing.com', 'microsoft.com', 'msn.com'],
  },
  zhihu: {
    url: (q) => 'https://www.zhihu.com/search?type=content&q=' + encodeURIComponent(q),
    items: ['.SearchResult-Card', '.Card', '.ContentItem'],
    keep: 'site',
    hosts: ['zhihu.com'],
  },
  bilibili: {
    url: (q) => 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(q),
    items: ['.bili-video-card', '.video-list-item', '.bili-video-card__info--tit'],
    keep: 'site',
    hosts: ['bilibili.com', 'b23.tv'],
  },
}

/** One query, the site it belongs to, and the links that answer it. */
export async function searchSite(engine, query, limit) {
  const name = Object.prototype.hasOwnProperty.call(ENGINES, engine) ? engine : 'bing'
  const spec = ENGINES[name]
  const cap = Math.min(Math.max(Number(limit) || 10, 1), 30)
  let res = null
  try {
    res = await browse(spec.url(query), {
      items: spec.items, maxChars: 1500, wait: 2600, scroll: 1, itemLimit: cap, linkLimit: 200,
    })
  } catch (error) {
    res = { ok: false, error: String((error && error.message) || error) }
  }
  if (!res || !res.ok) return { ok: false, engine: name, query, error: (res && res.error) || '没有取到结果' }
  const seen = new Set()
  const rows = []
  for (const link of res.links || []) {
    const host = hostOf(link.href)
    if (!host) continue
    const inside = spec.hosts.some((h) => host === h || host.endsWith('.' + h))
    if (spec.keep === 'site' && !inside) continue
    if (spec.keep === 'external' && inside) continue
    if (/\/(search|login|signin|passport)\b/.test(link.href)) continue
    if (seen.has(link.href)) continue
    seen.add(link.href)
    rows.push({ title: link.text, url: link.href })
    if (rows.length >= cap) break
  }
  return {
    ok: true, engine: name, query, loginWall: Boolean(res.loginWall),
    total: rows.length, results: rows, snippets: (res.items || []).slice(0, cap),
  }
}
