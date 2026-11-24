/**
 * Render the panel without a browser: load the built client, hand it a stub
 * React, and read the element tree the page component produces.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildData } from '../data.mjs'

const src = readFileSync(fileURLToPath(new URL('../client.js', import.meta.url)), 'utf8')
const store = new Map([
  ['humanitiesWorkbench.view', 'terms'],
  ['humanitiesWorkbench.config', 'default'],
  ['humanitiesWorkbench.mode', 'custom'],
])
let definition = null
globalThis.window = {
  __ModuleLoader__: { load(def) { definition = def } },
  localStorage: {
    getItem(key) { return store.has(key) ? store.get(key) : null },
    setItem(key, value) { store.set(key, value) },
  },
  addEventListener() {},
  removeEventListener() {},
  navigator: { clipboard: { writeText() {} } },
  fetch() { return new Promise(function () {}) },
}
globalThis.document = {
  body: { appendChild() {} },
  createElement() { return { click() {}, style: {} } },
  getElementById() { return null },
}
new Function(src)()

if (!definition || typeof definition.factory !== 'function') {
  process.stdout.write('FAIL client definition not captured\n')
  process.exit(1)
}

let tree = null
function createElement(type, props) {
  const children = Array.prototype.slice.call(arguments, 2)
  return { type, props: Object.assign({}, props || {}, { children: children.length <= 1 ? children[0] : children }) }
}
let hookIndex = 0
const plan = new Map()
function useState(init) {
  const index = hookIndex++
  const base = typeof init === 'function' ? init() : init
  return [plan.has(index) ? plan.get(index) : base, function () {}]
}
const React = { createElement, useState, useEffect() {}, useRef() { return { current: null } }, useMemo(fn) { return fn() } }

const mod = definition.factory(function (name) {
  if (name === 'react') return React
  throw new Error('unexpected module: ' + name)
})

const slots = {}
const ctx = {
  effect(fn) { return fn() },
  locale: { register() {}, bind() { return function (key) { return key } } },
  slots: {
    inject(name, fn) { fn() },
    register(def, component) { slots[def.name] = component; return function () {} },
  },
  get() { return undefined },
}
mod.apply(ctx)

const Page = slots.main
if (typeof Page !== 'function') {
  process.stdout.write('FAIL page component not registered\n')
  process.exit(1)
}

const skillDir = fileURLToPath(new URL('../skill', import.meta.url)).replace(/[\\/]+$/, '')
const data = buildData({ skillDir, subsDir: '' })
const payload = Object.assign({}, data, {
  config: { id: 'default', name: 'default', tabs: ['overview', 'facts', 'tensions', 'rules', 'redlines', 'refs'], note: '' },
  status: {},
  corpus: { ready: false, stale: false, segments: 0 },
  frontend: null,
  frontendError: '',
  browser: {
    running: true, version: 'Edg/157.0.4341.60', mode: 'headless', port: 9411, targets: 1,
    profile: { dir: 'D:\\tmp\\browser', exists: true, lastUsed: '' }, browser: 'Edge',
    sites: [{ id: 'x', name: 'X', url: 'https://x.com/' }, { id: 'bilibili', name: 'B站', url: 'https://www.bilibili.com/' }],
  },
})
function render(payload, view) {
  plan.clear()
  plan.set(2, payload)
  store.set('humanitiesWorkbench.view', view)
  hookIndex = 0
  const tree = Page({ t: function (key) { return key }, openWizard() { return 'copied' }, exportMd() {} })
  const collected = []
  let depth = 0
  const walk = function (node) {
    if (node === null || node === undefined || node === false) return
    if (depth > 40) return
    if (typeof node === 'string' || typeof node === 'number') { collected.push(String(node)); return }
    if (Array.isArray(node)) { node.forEach(walk); return }
    if (typeof node !== 'object' || !node.type) return
    if (typeof node.type === 'function') {
      depth++
      let rendered = null
      try { rendered = node.type(node.props) } catch (error) { rendered = null }
      walk(rendered)
      depth--
      return
    }
    walk(node.props.children)
  }
  walk(tree)
  return { nodes: collected.length, text: collected.join('\n') }
}

const checks = []
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: detail === undefined ? '' : String(detail) })

const termsView = render(payload, 'terms')
check('tree rendered', termsView.nodes > 40, termsView.nodes + ' text nodes')
check('terms tab present', termsView.text.indexOf('术语与译名') >= 0)
check('term card rendered', termsView.text.indexOf('长时段') >= 0 && termsView.text.indexOf('longue durée') >= 0)
check('alternate names shown', termsView.text.indexOf('又译') >= 0)
check('term count note', /共 16 条/.test(termsView.text))
const order = ['刷新', '新建配置', '导入', '导出'];
const at = order.map(function (label) { return termsView.text.indexOf('\n' + label + '\n'); });
check('header order starts 刷新', at[0] >= 0 && at[1] > at[0] && at[2] > at[1] && at[3] > at[2], at.join(','));
check('login page entry', termsView.text.indexOf('登录与抓取') >= 0)
check('refine entry', termsView.text.indexOf('完善配置') >= 0)
check('no old checkbox', termsView.text.indexOf('对话改配置') < 0)

const overview = render(payload, 'overview')
check('overview still renders', overview.nodes > 40 && overview.text.indexOf('边界条件') >= 0, overview.nodes + ' nodes')
check('tabs list terms', overview.text.indexOf('术语') >= 0)

const bare = Object.assign({}, payload, { terms: { total: 0, list: [] } })
const bareView = render(bare, 'overview')
check('no terms tab without a table', bareView.text.indexOf('术语与译名') < 0)
check('no empty term tab label', bareView.text.indexOf('\n术语\n') < 0)

const browserPage = render(payload, 'browser')
check('browser page heading', browserPage.text.indexOf('登录状态') >= 0 && browserPage.text.indexOf('操作') >= 0)
check('browser page actions', browserPage.text.indexOf('检测登录状态') >= 0 && browserPage.text.indexOf('关闭') >= 0)
check('browser page lists sites', browserPage.text.indexOf('B站') >= 0 && browserPage.text.indexOf('x.com') >= 0)
check('browser page states', browserPage.text.indexOf('未检测') >= 0)
check('browser page running pill', browserPage.text.indexOf('后台运行中') >= 0)

const idle = Object.assign({}, payload, { browser: Object.assign({}, payload.browser, { running: false, mode: '' }) })
const idlePage = render(idle, 'browser')
check('browser page idle', idlePage.text.indexOf('未启动') >= 0)

const logged = Object.assign({}, payload, {
  browser: Object.assign({}, payload.browser, {
    loginCheckedAt: '2026-11-24T05:00:00.000Z',
    sites: [
      { id: 'bilibili', name: 'B站', url: 'https://www.bilibili.com/', loginWall: false, error: '' },
      { id: 'x', name: 'X', url: 'https://x.com/', loginWall: true, error: '' },
    ],
  }),
})
const loggedPage = render(logged, 'browser')
check('logged state shown', loggedPage.text.indexOf('已登录') >= 0 && loggedPage.text.indexOf('未登录') >= 0)
check('checked time shown', loggedPage.text.indexOf('上次检测') >= 0)

check('no arrow glyphs', termsView.text.indexOf('\u2192') < 0 && termsView.text.indexOf('\u21d2') < 0)

const failed = checks.filter((row) => !row.ok)
for (const row of checks) process.stdout.write((row.ok ? 'ok   ' : 'FAIL ') + row.name + (row.detail ? '  [' + row.detail + ']' : '') + '\n')
process.stdout.write('\n' + (checks.length - failed.length) + '/' + checks.length + ' passed\n')
process.exit(failed.length ? 1 : 0)
