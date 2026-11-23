import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { serveFrontend, frontendUrl, resolveFrontend, frontendSpec, FRONTEND_PATH } from '../index.js'

let pass = 0
const fails = []
function check(name, ok, detail) {
  if (ok) { pass += 1; return }
  fails.push(name + (detail ? ' :: ' + detail : ''))
}

const base = mkdtempSync(join(tmpdir(), 'hw-front-'))
const root = join(base, 'frontend')
mkdirSync(join(root, 'sub'), { recursive: true })
writeFileSync(join(root, 'index.html'), '<!doctype html><html><body><h1>panel</h1></body></html>', 'utf8')
writeFileSync(join(root, 'app.js'), 'console.log(1)', 'utf8')
writeFileSync(join(root, 'sub', 'x.css'), 'body{margin:0}', 'utf8')
writeFileSync(join(root, 'notes.md'), '# private', 'utf8')
writeFileSync(join(root, 'blob.bin'), 'x', 'utf8')
writeFileSync(join(base, 'secret.txt'), 'SECRET', 'utf8')

const req = (path, init) => new Request('http://127.0.0.1' + path, init || {})
const urlOf = (rel) => frontendUrl('default', rel)

// spec normalisation
check('spec null', frontendSpec(null) === null)
check('spec string', frontendSpec('frontend').entry === 'index.html', JSON.stringify(frontendSpec('frontend')))
check('spec object height clamp', frontendSpec({ dir: 'f', height: 99999 }).height === 4000)
check('spec strips leading slash', frontendSpec({ dir: 'f', entry: '/index.html' }).entry === 'index.html')

// resolution
const fx = resolveFrontend(base, 'frontend')
check('resolve ok', fx.ok === true, fx.reason)
check('resolve entryPath', fx.entryPath === join(root, 'index.html'), fx.entryPath)
check('resolve missing dir', resolveFrontend(base, 'nope').ok === false)
check('resolve escape entry', resolveFrontend(base, { dir: 'frontend', entry: '../secret.txt' }).ok === false)
check('resolve no skillDir', resolveFrontend('', 'frontend').ok === false)

// serving
const get = async (path, init) => serveFrontend(req(path, init), { root })

const r1 = await get(urlOf('index.html'))
check('index 200', r1.status === 200, String(r1.status))
check('index mime', (r1.headers.get('content-type') || '').startsWith('text/html'), r1.headers.get('content-type'))
check('index body', (await r1.text()).includes('<h1>panel</h1>'))

const r2 = await get(urlOf('app.js'))
check('js mime', (r2.headers.get('content-type') || '').startsWith('text/javascript'), r2.headers.get('content-type'))
const r3 = await get(urlOf('sub/x.css'))
check('nested css', r3.status === 200 && (r3.headers.get('content-type') || '').startsWith('text/css'), String(r3.status))

const rEmpty = await get(FRONTEND_PATH + '/' + urlOf('index.html').split('/')[3] + '/default/')
check('dir index', rEmpty.status === 200, String(rEmpty.status))

const r4 = await get(urlOf('notes.md'))
check('md refused 403', r4.status === 403, String(r4.status))
const r5 = await get(urlOf('blob.bin'))
check('bin refused 403', r5.status === 403, String(r5.status))
const r6 = await get(urlOf('..%2Fsecret.txt'))
check('traversal 403', r6.status === 403, String(r6.status))
const r7 = await get(urlOf('%2E%2E%2Fsecret.txt'))
check('encoded traversal 403', r7.status === 403, String(r7.status))
const token = urlOf('index.html').split('/')[3]
const r8 = await get(FRONTEND_PATH + '/' + token + '/default/%zz')
check('bad escape 400', r8.status === 400, String(r8.status))
const r9 = await get(urlOf('missing.js'))
check('missing 404', r9.status === 404, String(r9.status))

const badToken = FRONTEND_PATH + '/deadbeefdeadbeefdeadbeef/default/index.html'
const r10 = await serveFrontend(req(badToken), { root })
check('bad token 404', r10.status === 404, String(r10.status))

const head = await get(urlOf('index.html'), { method: 'HEAD' })
check('head 200 empty', head.status === 200 && (await head.text()) === '', String(head.status))

const probe = await get(urlOf('index.html'))
const etag = probe.headers.get('etag')
const cached = await get(urlOf('index.html'), { headers: { 'if-none-match': etag } })
check('etag 304', cached.status === 304, String(cached.status))
check('no-referrer', probe.headers.get('referrer-policy') === 'no-referrer')

const noRoot = await serveFrontend(req(urlOf('index.html')), { root: '' })
check('no root 404', noRoot.status === 404, String(noRoot.status))

rmSync(base, { recursive: true, force: true })
console.log('frontend checks: pass=' + pass + ' fail=' + fails.length)
for (const bad of fails) console.log('  FAIL ' + bad)
if (fails.length) process.exit(1)
console.log('OK frontend')