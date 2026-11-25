/**
 * End-to-end check of the private-browser layer: a local page, a real Edge,
 * a headless run, extraction, the login wall and the private-address guard.
 */
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const profile = mkdtempSync(join(tmpdir(), 'hw-browser-'))
process.env.HW_BROWSER_DIR = profile
process.env.HW_CDP_PORT = '9419'

const { browse, browserStatus, openLogin, shutdown, siteFor, findBrowser, isPrivateTarget } = await import('../browser.mjs')

const PAGE = '<!doctype html><html><head><meta charset="utf-8"><title>样例页</title></head><body>' +
  '<article><h1>标题</h1><p>正文第一段。</p></article>' +
  '<div data-testid="tweetText">第一条动态内容</div>' +
  '<div data-testid="tweetText">第二条动态内容</div>' +
  '</body></html>'
const WALL = '<!doctype html><html><head><meta charset="utf-8"><title>需要登录</title></head><body>' +
  '<div class="bili-login-card">扫码登录</div><p>登录后查看完整内容</p></body></html>'

const server = createServer((req, res) => {
  const wall = req.url === '/wall'
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end(wall ? WALL : PAGE)
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const port = server.address().port
const base = 'http://127.0.0.1:' + port

const checks = []
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: detail === undefined ? '' : String(detail) })

check('adapter x', (siteFor('https://x.com/home') || {}).id === 'x')
check('adapter bilibili', (siteFor('https://www.bilibili.com/video/BV1xx') || {}).id === 'bilibili')
check('adapter none', siteFor('https://example.com/a') === null)
check('browser found', Boolean(findBrowser()), findBrowser() && findBrowser().name)
check('private target loopback', isPrivateTarget('http://127.0.0.1:8080/x') === true)
check('private target localhost', isPrivateTarget('http://localhost/x') === true)
check('private target metadata', isPrivateTarget('http://169.254.169.254/latest/meta-data/') === true)
check('private target v6 loopback', isPrivateTarget('http://[::1]/x') === true)
check('public target passes', isPrivateTarget('https://x.com/home') === false)

let refused = ''
try { await browse('http://127.0.0.1:' + port + '/') } catch (error) { refused = String(error.message || error) }
check('private address refused', /内网/.test(refused), refused)

const page = await browse(base + '/', { testAllowLocal: true, wait: 600, maxChars: 2000, items: ['[data-testid="tweetText"]'] })
check('browse ok', page.ok, page.error || '')
check('title read', page.title === '样例页', page.title)
check('article preferred', /正文第一段/.test(page.text || ''), (page.text || '').slice(0, 40))
check('items picked', (page.items || []).length === 2, (page.items || []).join(' | '))
check('no login wall', page.loginWall === false)

const wall = await browse(base + '/wall', { testAllowLocal: true, wait: 400 })
check('login wall seen', wall.ok && wall.loginWall === true, JSON.stringify({ ok: wall.ok, wall: wall.loginWall }))

const status = await browserStatus()
check('status running', status.running === true, status.version)
check('status headless', status.mode === 'headless', status.mode)
check('status sites', status.sites.length === 13, status.sites.length)
const readOnly = status.sites.filter((row) => row.login === false).map((row) => row.id)
check('read-only archives marked', readOnly.join(',') === 'gallica,persee,ndl', readOnly.join(','))

const bad = await openLogin('nope')
check('unknown site refused', bad.ok === false && /可选/.test(bad.error || ''), bad.error)

const stopped = await shutdown()
check('stopped', stopped.running === false)

server.close()
try { rmSync(profile, { recursive: true, force: true }) } catch { /* locked by a dying browser */ }

const failed = checks.filter((row) => !row.ok)
for (const row of checks) process.stdout.write((row.ok ? 'ok   ' : 'FAIL ') + row.name + (row.detail ? '  [' + row.detail + ']' : '') + '\n')
process.stdout.write('\n' + (checks.length - failed.length) + '/' + checks.length + ' passed\n')
process.exit(failed.length ? 1 : 0)
