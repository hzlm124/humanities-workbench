import { fileURLToPath } from 'node:url'
import { buildData } from '../data.mjs'
import { apply, DATA_PATH, CONFIGS_PATH, FRONTEND_PATH, frontendPayload } from '../index.js'

const repoRoot = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const data = buildData()
console.log('parser: rules=' + data.rules.length + ' refs=' + data.refs.length)

const routes = new Map()
const tools = new Map()
const ctx = {
  webServer: { register(r) { routes.set(r.path, r); return () => {} } },
  tools: { register(d) { tools.set(d.name, d); return () => {} } },
  effect(fn) { return fn() },
}
apply(ctx, {})

const call = async (path, query) => {
  const route = routes.get(path)
  if (!route) throw new Error('missing route ' + path)
  const res = await route.resource(new Request('http://127.0.0.1' + path + (query || '')))
  return { status: res.status, body: await res.json() }
}

const configs = await call(CONFIGS_PATH)
console.log('routes=' + routes.size + ' tools=' + Array.from(tools.keys()).join(',') + ' configs=' + configs.body.configs.map((c) => c.id).join(','))
for (const c of configs.body.configs) {
  const r = await call(DATA_PATH, '?config=' + encodeURIComponent(c.id))
  console.log('  ' + c.id + ': ' + r.status + ' rules=' + r.body.rules.length + ' refs=' + r.body.refs.length + ' tabs=' + r.body.config.tabs.join('/'))
}
const front = routes.get(FRONTEND_PATH)
console.log('frontend_route=' + (front ? front.kind + '/' + front.auth : 'MISSING'))
console.log('frontend_payload_none=' + JSON.stringify(frontendPayload(null, data, '')))
console.log('frontend_payload_bad=' + JSON.stringify(frontendPayload(null, { frontend: 'nope' }, repoRoot)))

// hw_term 跟的是配置里的 skillDir，所以单开一个上下文指向内置目录
const bundledDir = fileURLToPath(new URL('../skill/', import.meta.url)).replace(/[\\/]+$/, '')
const termTools = new Map()
const termCtx = {
  webServer: { register() { return () => {} } },
  tools: { register(d) { termTools.set(d.name, d); return () => {} } },
  effect(fn) { return fn() },
}
apply(termCtx, { skillDir: bundledDir })
const termTool = termTools.get('hw_term')
const termHit = JSON.parse(await termTool.execute({ query: 'longue' }))
const termMiss = JSON.parse(await termTool.execute({ query: 'zzz-not-a-term' }))
const termAll = JSON.parse(await termTool.execute({ query: '', all: true }))
console.log('terms=' + data.terms.total + ' lookup=' + termHit.hits.length + ' first=' + (termHit.hits[0] && termHit.hits[0].zh) +
  ' miss=' + termMiss.hits.length + ' hint=' + Boolean(termMiss.hint) + ' all=' + termAll.total)

const browserNames = ['hw_browse', 'hw_login', 'hw_browser_state']
const browserTools = browserNames.map((name) => tools.get(name))
const dataRoute = await call(DATA_PATH)
console.log('browser_tools=' + browserTools.filter(Boolean).length + ' browser_in_payload=' + Object.prototype.hasOwnProperty.call(dataRoute.body, 'browser') +
  ' browser_sites=' + ((dataRoute.body.browser && dataRoute.body.browser.sites && dataRoute.body.browser.sites.length) || 0))

const bad = Array.from(tools.values()).filter((d) => !d.description || !d.parameters || typeof d.execute !== 'function')
const termOk = data.terms.total === 16 && termHit.hits.length === 1 && termHit.hits[0].zh === '长时段' &&
  termMiss.hits.length === 0 && termMiss.hint && termAll.total === 16
console.log('term_checks=' + (termOk ? 'OK' : 'FAIL'))
console.log('tool_shape_bad=' + bad.length)
console.log('OK')
