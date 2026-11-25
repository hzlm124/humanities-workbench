/**
 * Switches and the methodology digest: what reaches the model, and what does
 * not once the red light is on.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readState, writeState, statePath } from '../state.mjs'
import { buildDigest, digestFor, matchCorpus, lastUserText, readPanel, SKILL_NAME } from '../prompt.mjs'

const root = mkdtempSync(join(tmpdir(), 'hw-prompt-'))
process.env.HW_STATE_FILE = join(root, 'state.json')
const statePathResolved = statePath()
const checks = []
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: detail === undefined ? '' : String(detail) })

const skill = join(root, 'skill')
mkdirSync(join(skill, 'profile'), { recursive: true })
const panel = {
  thesis: '结构规定可能性，结果由情势与抉择决定。',
  boundary: ['自由受共同体规范约束', '国家消亡是双重任务'],
  redlines: [['红线一', '非目的论', '不写必然走向'], ['红线二', '不作自由主义前提', '不用个人自由权作最终回溯'], ['红线三', 'fiction 标记', '架空标 fiction']],
  redlineNote: '红线三 > 红线一 > 其余',
}
writeFileSync(join(skill, 'profile', 'panel.json'), JSON.stringify(panel), 'utf8')

const corpus = {
  stats: { files: 2, segments: 2 },
  segments: [{ b: 'BV1', f: 'a.srt', s: 0, e: 1, t: '症候阅读要在该说没说处定位立场' }, { b: 'BV2', f: 'b.srt', s: 0, e: 1, t: '过度决定与情势分析' }],
}

try {
  const base = readState()
  check('switches default on', base.method === true && base.corpus === true, JSON.stringify(base))

  const off = writeState({ method: false })
  check('method switch persists', off.method === false && readState().method === false && existsSync(statePathResolved))
  writeState({ method: 'yes' })
  check('non-boolean ignored', readState().method === false)

  const config = { name: '技术红茶', skillDir: skill }
  check('red light removes the block', digestFor({ config, state: { method: false, corpus: true }, skillDir: skill }) === '')

  const on = digestFor({ config, state: { method: true, corpus: true }, skillDir: skill, userText: '今天天气如何' })
  check('digest names the config', on.indexOf('技术红茶') >= 0, on.slice(0, 40))
  check('digest carries red lines', on.indexOf('非目的论') >= 0 && on.indexOf('不作自由主义前提') >= 0)
  check('digest points at the skill', on.indexOf(SKILL_NAME) >= 0 && on.indexOf('定位符') >= 0)
  check('digest stays short', on.length > 80 && on.length <= 1600, 'len=' + on.length)
  check('no corpus hint without a hit', on.indexOf('语料：') < 0)

  const hit = digestFor({ config, state: { method: true, corpus: true }, skillDir: skill, corpus, userText: '症候阅读和过度决定怎么用' })
  check('corpus hit adds a hint', hit.indexOf('语料：') >= 0, hit.split('\n').slice(-1)[0])
  check('terms from the message', /语料：.*症候/.test(hit), hit.split('\n').slice(-1)[0])

  const corpusOff = digestFor({ config, state: { method: true, corpus: false }, skillDir: skill, corpus, userText: '症候阅读和过度决定怎么用' })
  check('corpus switch off drops the hint', corpusOff.indexOf('语料：') < 0)

  check('matchCorpus needs two terms', matchCorpus(corpus, '症候').length === 0 && matchCorpus(corpus, '症候阅读过度决定').length >= 2)
  check('unknown session reads empty', lastUserText(undefined) === '' && lastUserText({}) === '')

  const fakeSession = {
    surface: { nodes: [1, 2] },
    eventAt: (seq) => (seq === 2 ? { type: 'user/message', data: { content: [{ type: 'text', text: '这段怎么读' }] } } : { type: 'assistant/message', data: {} }),
  }
  check('last user message read', lastUserText(fakeSession) === '这段怎么读')
  check('broken session never throws', lastUserText({ surface: { nodes: [1] }, eventAt: () => { throw new Error('boom') } }) === '')

  check('missing panel still yields a digest', buildDigest({ configName: 'x', panel: readPanel(join(root, 'nope')) }).indexOf('humanities-research') > 0)
} finally {
  rmSync(root, { recursive: true, force: true })
}

const failed = checks.filter((row) => !row.ok)
for (const row of checks) if (!row.ok) console.log('FAIL ' + row.name + (row.detail ? ' :: ' + row.detail : ''))
console.log('prompt: ' + (checks.length - failed.length) + '/' + checks.length + ' checks passed; temp removed=' + !existsSync(root))
process.exit(failed.length ? 1 : 0)
