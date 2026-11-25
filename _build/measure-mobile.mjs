/**
 * Measure the real panel at phone widths: same CSS, same rendered tree,
 * opened in Edge with device metrics overridden to 375 and 414 CSS pixels.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { buildData } from '../data.mjs'

const PORT = Number(process.env.HW_MEASURE_PORT) || 9421
const src = readFileSync(fileURLToPath(new URL('../client.js', import.meta.url)), 'utf8')
const store = new Map([['humanitiesWorkbench.view', 'terms'], ['humanitiesWorkbench.config', 'default'], ['humanitiesWorkbench.mode', 'custom']])
let definition = null
globalThis.window = {
  __ModuleLoader__: { load(def) { definition = def } },
  localStorage: { getItem(k) { return store.has(k) ? store.get(k) : null }, setItem(k, v) { store.set(k, v) } },
  addEventListener() {}, removeEventListener() {},
  navigator: { clipboard: { writeText() {} } },
  fetch() { return new Promise(function () {}) },
}
globalThis.document = { body: { appendChild() {} }, createElement() { return { click() {}, style: {} } }, getElementById() { return null } }
new Function(src)()

let hookIndex = 0
const plan = new Map()
const React = {
  createElement(type, props) {
    const children = Array.prototype.slice.call(arguments, 2)
    return { type, props: Object.assign({}, props || {}, { children: children.length <= 1 ? children[0] : children }) }
  },
  useState(init) {
    const index = hookIndex++
    const base = typeof init === 'function' ? init() : init
    return [plan.has(index) ? plan.get(index) : base, function () {}]
  },
  useEffect() {}, useRef() { return { current: null } }, useMemo(fn) { return fn() },
}
const mod = definition.factory(function (name) { if (name === 'react') return React; throw new Error('unexpected module: ' + name) })
const slots = {}
mod.apply({ effect(fn) { return fn() }, locale: { register() {}, bind() { return function (k) { return k } } },
  slots: { inject(n, fn) { fn() }, register(def, c) { slots[def.name] = c; return function () {} } }, get() { return undefined } })

const escaped = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const styleText = (style) => Object.keys(style || {}).map((k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' + style[k]).join(';')
let css = ''
function toHtml(node) {
  if (node === null || node === undefined || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return escaped(node)
  if (Array.isArray(node)) return node.map(toHtml).join('')
  if (typeof node !== 'object' || !node.type) return ''
  if (typeof node.type === 'function') return toHtml(node.type(node.props))
  if (node.type === 'style') { css = String(node.props.children || ''); return '' }
  const p = node.props || {}
  const tag = node.type
  const attrs = []
  if (p.className) attrs.push('class="' + escaped(p.className) + '"')
  if (p.style) attrs.push('style="' + escaped(styleText(p.style)) + '"')
  if (p.title) attrs.push('title="' + escaped(p.title) + '"')
  if (p.href) attrs.push('href="' + escaped(p.href) + '"')
  if (p.type && tag === 'button') attrs.push('type="button"')
  if (p.disabled) attrs.push('disabled')
  if (p['aria-pressed'] !== undefined) attrs.push('aria-pressed="' + escaped(p['aria-pressed']) + '"')
  if (p.placeholder) attrs.push('placeholder="' + escaped(p.placeholder) + '"')
  const children = toHtml(p.children)
  if (tag === 'input' || tag === 'br') return '<' + tag + ' ' + attrs.join(' ') + '>'
  return '<' + tag + (attrs.length ? ' ' + attrs.join(' ') : '') + '>' + children + '</' + tag + '>'
}

const skillDir = fileURLToPath(new URL('../skill', import.meta.url)).replace(/[\\/]+$/, '')
const data = buildData({ skillDir, subsDir: '' })
const payload = Object.assign({}, data, {
  config: { id: 'default', name: '技术红茶', tabs: ['overview', 'facts', 'tensions', 'rules', 'redlines', 'refs'], note: '' },
  status: {}, corpus: { ready: false, stale: false, segments: 0 }, frontend: null, frontendError: '',
  switches: { method: true, corpus: true },
  browser: {
    running: true, mode: 'headless', browser: 'Edge', targets: 1, loginCheckedAt: '2026-11-25T10:00:00.000Z',
    selfTest: { at: '2026-11-25T10:00:00.000Z', ok: true, title: 'Example Domain', chars: 219, ms: 1840, error: '' },
    sites: [{ id: 'bilibili', name: 'B站', url: 'https://www.bilibili.com/', loginWall: null, error: '' }, { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/', loginWall: true, error: '' }],
  },
})

function renderHtml(view, extra) {
  plan.clear()
  plan.set(2, payload)
  if (extra) extra(plan)
  store.set('humanitiesWorkbench.view', view)
  hookIndex = 0
  css = ''
  const tree = slots.main({ t: function (k) { return k }, openWizard() { return 'copied' }, exportMd() {} })
  const body = toHtml(tree)
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + 'html,body{margin:0;padding:0}.hw{height:auto}</style></head><body><div id="root">' + body + '</div></body></html>'
}

const work = mkdtempSync(join(tmpdir(), 'hw-measure-'))
const profile = join(work, 'profile')
mkdirSync(profile, { recursive: true })
const files = { terms: join(work, 'terms.html'), browser: join(work, 'browser.html'), config: join(work, 'config.html'), menu: join(work, 'menu.html') }
writeFileSync(files.terms, renderHtml('terms'), 'utf8')
writeFileSync(files.browser, renderHtml('browser'), 'utf8')
writeFileSync(files.config, renderHtml('terms', function (p) {
  p.set(0, [{ id: 'default', name: '技术红茶' }, { id: 'tiehong', name: '技术红茶·长名字的一套配置用来挤压布局' }])
  p.set(12, true)
}), 'utf8')
writeFileSync(files.menu, renderHtml('terms', function (p) {
  p.set(0, [{ id: 'default', name: '技术红茶' }, { id: 'tiehong', name: '技术红茶·另一套' }])
  p.set(9, true)
}), 'utf8')

const BROWSERS = [
  ['Microsoft\\Edge\\Application\\msedge.exe', 'Edge'],
  ['Google\\Chrome\\Application\\chrome.exe', 'Chrome'],
]
function findBrowser() {
  const bases = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean)
  for (const [tail, name] of BROWSERS) for (const base of bases) {
    const exe = join(base, tail)
    if (existsSync(exe)) return { exe, name }
  }
  return null
}
const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
const cdp = (path) => 'http://127.0.0.1:' + PORT + path

async function up() {
  for (let i = 0; i < 40; i++) {
    try { const res = await fetch(cdp('/json/version'), { signal: AbortSignal.timeout(800) }); if (res.ok) return await res.json() } catch { /* not up */ }
    await sleep(250)
  }
  return null
}

function client(url) {
  const socket = new WebSocket(url)
  const pending = new Map()
  let id = 1
  const ready = new Promise((resolve, reject) => { socket.onopen = () => resolve(); socket.onerror = () => reject(new Error('ws failed')) })
  socket.onmessage = (event) => {
    let msg = null
    try { msg = JSON.parse(String(event.data)) } catch { return }
    if (!msg.id || !pending.has(msg.id)) return
    const row = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) row.reject(new Error(msg.error.message || 'cdp error'))
    else row.resolve(msg.result)
  }
  const send = (method, params) => new Promise((resolve, reject) => {
    const mid = id++
    pending.set(mid, { resolve, reject })
    socket.send(JSON.stringify({ id: mid, method, params: params || {} }))
  })
  return { ready, send, close() { try { socket.close() } catch { /* closed */ } } }
}

const found = findBrowser()
if (!found) { console.log('measure: no browser'); process.exit(2) }
const child = spawn(found.exe, [
  '--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
  '--no-first-run', '--no-default-browser-check', '--disable-sync', '--window-size=1200,900', 'about:blank',
], { stdio: 'ignore', windowsHide: true })

const checks = []
let browserInfo = null
try {
  browserInfo = await up()
  if (!browserInfo) throw new Error('调试口没有起来')
  const made = await (await fetch(cdp('/json/new?about:blank'), { method: 'PUT' })).json()
  const page = client(made.webSocketDebuggerUrl)
  await page.ready
  await page.send('Page.enable')
  await page.send('Runtime.enable')
  const measure = async (url, view, width) => {
    await page.send('Emulation.setDeviceMetricsOverride', { width, height: 820, deviceScaleFactor: 2, mobile: true })
    await page.send('Page.navigate', { url })
    await sleep(700)
    const expr = 'JSON.stringify({inner: window.innerWidth,' +
      ' scroll: document.documentElement.scrollWidth,' +
      ' body: document.body.scrollWidth,' +
      ' wide: Array.prototype.slice.call(document.querySelectorAll("#root *")).filter(function (el) {' +
        ' var r = el.getBoundingClientRect(); return r.right > window.innerWidth + 1 && r.width > 0' +
      ' }).slice(0, 4).map(function (el) { return el.tagName + "." + String(el.className || "").slice(0, 40) }),' +
      ' small: Array.prototype.slice.call(document.querySelectorAll("button, input")).filter(function (el) {' +
        ' var r = el.getBoundingClientRect(); return r.height > 0 && r.height < 24' +
      ' }).slice(0, 4).map(function (el) { return el.tagName + "." + String(el.className || "") + ":" + Math.round(el.getBoundingClientRect().height) }),' +
      ' lamps: document.querySelectorAll(".hw-lamp").length,' +
      ' opts: document.querySelectorAll(".hw-sheet .hw-opt").length,' +
      ' menuOver: (function () {' +
        ' var m = document.querySelector(".hw-sheet"); var w = document.querySelector(".hw-wrap");' +
        ' if (!m || !w) return null; var a = m.getBoundingClientRect(), b = w.getBoundingClientRect();' +
        ' return Math.round(Math.max(b.left - a.left, a.right - b.right));' +
      ' })(),' +
      ' headtools: document.querySelectorAll(".hw-tools").length,' +
      ' headver: document.querySelectorAll(".hw-head .hw-ver").length,' +
      ' headpick: document.querySelectorAll(".hw-tools .hw-pickbtn").length,' +
      ' headupd: document.querySelectorAll(".hw-tools .hw-btn").length,' +
      ' headtext: document.querySelector(".hw-head") ? String(document.querySelector(".hw-head").textContent || "") : "",' +
      ' headleft: (function () { var t = document.querySelector(".hw-title"); var m = document.querySelector(".hw-tools");' +
        ' if (!t || !m) return 999; return Math.round(Math.abs(t.getBoundingClientRect().left - m.getBoundingClientRect().left));' +
      ' })(),' +
      ' headdy: (function () { var t = document.querySelector(".hw-title"); var m = document.querySelector(".hw-tools");' +
        ' if (!t || !m) return null; var a = t.getBoundingClientRect(), b = m.getBoundingClientRect();' +
        ' return Math.round(Math.abs((a.top + a.height / 2) - (b.top + b.height / 2)));' +
      ' })(),' +
      ' tabs: document.querySelectorAll(".hw-tabs").length' + '})'
    const res = await page.send('Runtime.evaluate', { expression: expr, returnByValue: true })
    return JSON.parse(res.result.value)
  }
  for (const width of [375, 414]) {
    const overview = await measure('file:///' + files.terms.replace(/\\/g, '/'), 'terms', width)
    checks.push({ name: width + ' 主视图无横向溢出', ok: overview.wide.length === 0 && overview.scroll <= overview.inner, detail: JSON.stringify(overview.wide) + ' scroll=' + overview.scroll + ' inner=' + overview.inner })
    checks.push({ name: width + ' 主视图按钮不小于 24px', ok: overview.small.length === 0, detail: JSON.stringify(overview.small) })
    checks.push({ name: width + ' 两个开关灯存在', ok: overview.lamps === 2, detail: 'lamps=' + overview.lamps })
    const openList = await measure('file:///' + files.config.replace(/\\/g, '/'), 'terms', width)
    checks.push({ name: width + ' 配置列表在列内展开', ok: openList.opts >= 2 && openList.menuOver !== null && openList.menuOver <= 1, detail: 'opts=' + openList.opts + ' over=' + openList.menuOver })
    checks.push({ name: width + ' 一条工具列收齐控件', ok: openList.headtools === 1 && openList.headver === 1 && openList.headpick === 1 && openList.headupd === 2, detail: 'tools=' + openList.headtools + ' ver=' + openList.headver + ' pick=' + openList.headpick + ' btn=' + openList.headupd })
    checks.push({ name: width + ' 标题与工具列对齐', ok: openList.headdy !== null && (openList.headdy <= 10 || openList.headleft <= 4), detail: 'dy=' + openList.headdy + ' dleft=' + openList.headleft })
    checks.push({ name: width + ' 页头没有实时文字', ok: openList.headtext.indexOf('实时') < 0 && openList.headtext.indexOf('快照') < 0, detail: JSON.stringify(String(openList.headtext).slice(0, 60)) })
    checks.push({ name: width + ' 配置列表不越界', ok: openList.wide.length === 0 && openList.scroll <= openList.inner, detail: JSON.stringify(openList.wide) + ' scroll=' + openList.scroll + ' inner=' + openList.inner })
    checks.push({ name: width + ' 配置项不小于 24px', ok: openList.small.length === 0, detail: JSON.stringify(openList.small) })
    const openMenu = await measure('file:///' + files.menu.replace(/\\/g, '/'), 'terms', width)
    checks.push({ name: width + ' 维护菜单在列下展开', ok: openMenu.opts >= 5 && openMenu.menuOver !== null && openMenu.menuOver <= 1, detail: 'rows=' + openMenu.opts + ' over=' + openMenu.menuOver })
    checks.push({ name: width + ' 维护菜单不越界', ok: openMenu.wide.length === 0 && openMenu.scroll <= openMenu.inner, detail: JSON.stringify(openMenu.wide) })
    const sub = await measure('file:///' + files.browser.replace(/\\/g, '/'), 'browser', width)
    checks.push({ name: width + ' 二级页无主视图签', ok: sub.tabs === 0, detail: 'tabs=' + sub.tabs })
    checks.push({ name: width + ' 二级页无横向溢出', ok: sub.wide.length === 0 && sub.scroll <= sub.inner, detail: JSON.stringify(sub.wide) })
  }
  page.close()
} catch (error) {
  checks.push({ name: 'measure ran', ok: false, detail: String((error && error.message) || error) })
} finally {
  try { await fetch(cdp('/json/version')) && spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }) } catch { /* already gone */ }
  await sleep(600)
  try { rmSync(work, { recursive: true, force: true }) } catch { /* windows lock */ }
}

const failed = checks.filter((row) => !row.ok)
for (const row of checks) console.log((row.ok ? 'ok   ' : 'FAIL ') + row.name + (row.detail ? '  [' + row.detail + ']' : ''))
console.log('measure: ' + (checks.length - failed.length) + '/' + checks.length + ' passed; temp removed=' + !existsSync(work))
process.exit(failed.length ? 1 : 0)