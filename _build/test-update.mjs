/**
 * Upstream check without the network: version comparison, release-note
 * cleaning, cache reuse, a stale cache, and a failing request.
 */
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'hw-update-'))
process.env.HW_STATE_FILE = join(dir, 'state.json')
writeFileSync(process.env.HW_STATE_FILE, JSON.stringify({ method: true, corpus: true, config: '', updatedAt: '' }) + '\n')

const upd = await import('../update.mjs')
const { readState, writeState } = await import('../state.mjs')

let pass = 0
const fails = []
const check = (name, ok, detail) => { if (ok) { pass += 1; return } fails.push(name + (detail === undefined ? '' : ' [' + detail + ']')) }

check('local version reads package', /^\d+\.\d+\.\d+/.test(upd.localVersion()), upd.localVersion())
check('compare lower', upd.compareVersion('0.0.8', '0.0.9') === -1)
check('compare equal', upd.compareVersion('v0.0.9', '0.0.9') === 0)
check('compare higher', upd.compareVersion('0.1.0', '0.0.9') === 1)
check('compare junk equals', upd.compareVersion('nope', '1.0.0') === 0)
check('notes flattened', upd.cleanNotes('## 标题\n\n- 一条\n- 两条') === '标题 一条 两条', JSON.stringify(upd.cleanNotes('## 标题\n\n- 一条\n- 两条')))
const longNotes = upd.cleanNotes('x'.repeat(500))
check('notes capped', longNotes.length === 300 && longNotes.endsWith('…'), longNotes.length)

const okFetch = async () => ({ ok: true, status: 200, json: async () => ({ tag_name: 'v0.0.9', html_url: 'https://example.test/r', body: '修复若干', published_at: '2026-11-25T00:00:00Z' }) })
const fresh = await upd.checkUpdate({ fetchImpl: okFetch, state: readState(), now: Date.parse('2026-11-25T10:00:00Z') })
check('behind detected', fresh.behind === true, fresh.latest)
check('record offered for saving', fresh.record && fresh.record.latest === '0.0.9')
check('notes carried', fresh.notes === '修复若干', fresh.notes)

writeState({ update: fresh.record })
const cached = await upd.checkUpdate({ state: readState(), now: Date.parse('2026-11-25T11:00:00Z') })
check('cache reused', cached.cached === true && (await upd.checkUpdate({ state: readState(), now: Date.parse('2026-11-25T11:00:00Z'), fetchImpl: async () => { throw new Error('should not run') } })).cached === true)
check('cache not re-saved', cached.record === null)

const forced = await upd.checkUpdate({ fetchImpl: okFetch, state: readState(), now: Date.parse('2026-11-25T11:00:00Z'), force: true })
check('force bypasses cache', forced.cached === false && Boolean(forced.record))

const stale = await upd.checkUpdate({ fetchImpl: async () => { throw new Error('connect timeout') }, state: readState(), now: Date.parse('2026-11-26T23:00:00Z') })
check('stale cache survives failure', stale.cached === true && stale.error === 'connect timeout', JSON.stringify(stale))

rmSync(process.env.HW_STATE_FILE, { force: true })
writeFileSync(process.env.HW_STATE_FILE, JSON.stringify({ method: true, corpus: true }) + '\n')
const cold = await upd.checkUpdate({ fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({}) }), state: readState(), now: Date.parse('2026-11-27T00:00:00Z') })
check('failure without cache reports error', cold.behind === false && /403/.test(cold.error), JSON.stringify(cold))

const saved = writeState({ update: { latest: '0.0.10', url: 'https://x', notes: 'n', checkedAt: '2026-11-27T00:00:00Z', junk: 1 } })
check('update persisted', saved.update.latest === '0.0.10')
check('unknown keys dropped', saved.update.junk === undefined)
check('state file keeps update', readState().update.latest === '0.0.10')
const cleared = writeState({ update: null })
check('update can be cleared', cleared.update === null)

rmSync(dir, { recursive: true, force: true })
console.log('update: ' + pass + '/' + (pass + fails.length) + ' checks passed')
for (const line of fails) console.log('FAIL ' + line)
process.exit(fails.length ? 1 : 0)