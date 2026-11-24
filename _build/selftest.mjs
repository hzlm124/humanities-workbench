import { fileURLToPath } from 'node:url'
import { buildData } from '../data.mjs'
import { apply, DATA_PATH, CONFIGS_PATH, FRONTEND_PATH, BROWSER_PATH, browserAction, frontendPayload } from '../index.js'

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

const { readLogins, writeLogins } = await import('../browser.mjs')
const tmpLogins = new URL('../_build/tmp-logins.json', import.meta.url)
process.env.HW_LOGIN_FILE = tmpLogins.pathname.replace(/^\/([A-Za-z]:)/, '$1')
const wroteLogins = writeLogins({ checkedAt: '2026-11-24T00:00:00.000Z', sites: [{ id: 'x', name: 'X', loginWall: false, error: '' }] })
const readBack = readLogins()
try { (await import('node:fs')).unlinkSync(tmpLogins) } catch { /* already gone */ }
console.log('browser_route=' + (routes.has(BROWSER_PATH) ? 'registered' : 'MISSING') +
  ' logins_write=' + wroteLogins + ' logins_read=' + readBack.sites.length + ' checkedAt=' + readBack.checkedAt)

const auditTool = tools.get('hw_audit')
const graphTool = tools.get('hw_graph')
const auditShape = auditTool && auditTool.parameters.properties.dir && typeof auditTool.execute === 'function'
const graphShape = graphTool && Array.isArray(graphTool.parameters.properties.action.enum) && graphTool.parameters.properties.action.enum.length === 6
console.log('audit_tool=' + Boolean(auditShape) + ' graph_tool=' + Boolean(graphShape) + ' tools_total=' + tools.size)

const browserNames = ['hw_browse', 'hw_login', 'hw_browser_state']
const browserTools = browserNames.map((name) => tools.get(name))
const dataRoute = await call(DATA_PATH)
console.log('browser_tools=' + browserTools.filter(Boolean).length + ' browser_in_payload=' + Object.prototype.hasOwnProperty.call(dataRoute.body, 'browser') +
  ' browser_sites=' + ((dataRoute.body.browser && dataRoute.body.browser.sites && dataRoute.body.browser.sites.length) || 0))

const { mkdtempSync, rmSync } = await import('node:fs')
const { tmpdir } = await import('node:os')
const tmpResearch = mkdtempSync(tmpdir() + '\\hw-selftest-')
let toolChecks = false
try {
  const emptyAudit = JSON.parse(await auditTool.execute({ dir: tmpResearch }))
  const graphInit = JSON.parse(await graphTool.execute({ dir: tmpResearch, action: 'init', question: '为什么会这样', params: { maxDepth: 2 } }))
  const graphAdd = JSON.parse(await graphTool.execute({ dir: tmpResearch, action: 'add', question: '为何是此时', parent: 'N01', premise: '前提不同：时间由外部冲击决定' }))
  const graphDup = JSON.parse(await graphTool.execute({ dir: tmpResearch, action: 'add', question: '为何是此时？', parent: 'N01', premise: '前提不同：只是换了写法' }))
  const graphStatusTool = JSON.parse(await graphTool.execute({ dir: tmpResearch, action: 'status' }))
  toolChecks = emptyAudit.ok === false && emptyAudit.missing.length === 8 && graphInit.ok && graphAdd.ok &&
    graphDup.ok === false && graphStatusTool.status.nodes === 2
  console.log('tool_calls audit_missing=' + emptyAudit.missing.length + ' graph_nodes=' + graphStatusTool.status.nodes + ' dedupe=' + (graphDup.ok === false))
} catch (error) {
  console.log('tool_calls FAIL ' + String((error && error.message) || error))
} finally {
  try { rmSync(tmpResearch, { recursive: true, force: true }) } catch { /* windows lock */ }
}
console.log('tool_call_checks=' + (toolChecks ? 'OK' : 'FAIL'))

const bad = Array.from(tools.values()).filter((d) => !d.description || !d.parameters || typeof d.execute !== 'function')
const browserRoute = routes.get(BROWSER_PATH)
const mockRes = { statusCode: 0, headers: {}, setHeader(key, value) { this.headers[key] = value }, end() {} }
browserRoute.handler({ method: 'GET' }, mockRes)
const getStatus = mockRes.statusCode
const statusBody = await browserAction('status')
console.log('browser_http get=' + getStatus + ' kind=' + (browserRoute.handler ? 'handler' : 'resource') +
  ' sites=' + statusBody.browser.sites.length + ' running=' + Boolean(statusBody.browser.running))

const { EventEmitter } = await import('node:events')
const postReq = new EventEmitter()
postReq.method = 'POST'
const postRes = { statusCode: 0, body: '', setHeader() {}, end(body) { this.body = String(body || '') } }
const postDone = new Promise((resolve) => { const done = postRes.end.bind(postRes); postRes.end = function (body) { done(body); resolve() } })
browserRoute.handler(postReq, postRes)
postReq.emit('data', Buffer.from(JSON.stringify({ action: 'status' })))
postReq.emit('end')
await postDone
const postBody = JSON.parse(postRes.body || '{}')
console.log('browser_post status=' + postRes.statusCode + ' sites=' + ((postBody.browser && postBody.browser.sites.length) || 0))

const toolsOk = tools.size === 11 && Boolean(auditShape) && Boolean(graphShape)
const browserOk = routes.has(BROWSER_PATH) && getStatus === 405 && Boolean(browserRoute.handler) &&
  postRes.statusCode === 200 && (postBody.browser && postBody.browser.sites.length === 7) &&
  statusBody.browser.sites.length === 7 &&
  wroteLogins && readBack.sites.length === 1 && readBack.checkedAt === '2026-11-24T00:00:00.000Z'
console.log('browser_checks=' + (browserOk ? 'OK' : 'FAIL'))
const termOk = data.terms.total === 16 && termHit.hits.length === 1 && termHit.hits[0].zh === '长时段' &&
  termMiss.hits.length === 0 && termMiss.hint && termAll.total === 16
console.log('term_checks=' + (termOk ? 'OK' : 'FAIL'))
console.log('tool_shape_bad=' + bad.length)
const pass = toolsOk && toolChecks && bad.length === 0 && browserOk && termOk
console.log(pass ? 'OK' : 'FAIL')
process.exit(pass ? 0 : 1)
