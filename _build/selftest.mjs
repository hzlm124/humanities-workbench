import { buildData } from '../data.mjs'
import { apply, DATA_PATH, CONFIGS_PATH } from '../index.js'

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
const bad = Array.from(tools.values()).filter((d) => !d.description || !d.parameters || typeof d.execute !== 'function')
console.log('tool_shape_bad=' + bad.length)
console.log('OK')
