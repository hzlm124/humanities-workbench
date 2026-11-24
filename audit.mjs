/**
 * Research directory audit: which steps exist, which are missing, which are
 * present but thin. Pure functions so the self test can drive it without DSH.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const LEDGER_FIELDS = ['id', 'title', 'kind', 'locator', 'availability', 'read_level']
export const LEDGER_KINDS = ['archive', 'book', 'article', 'newspaper', 'statistics', 'map', 'oral', 'web', 'other']
export const LEDGER_AVAILABILITY = ['open', 'open-index', 'subscription', 'physical', 'surrogate', 'unobtainable']
export const LEDGER_READ = ['full', 'partial', 'index-only', 'quoted']

/** A locator is a page, paragraph, section, timecode, date or a URL with a date. */
export const LOCATOR = /(p\.\s?\d+|pp\.\s?\d+|第\s?\d+\s?[页段节行条]|§\s?\d+|\[\d{1,2}:\d{2}|t=\d+|\d{4}-\d{2}-\d{2}|https?:\/\/\S+)/

function filesIn(dir, sub, pattern) {
  try {
    return readdirSync(join(dir, sub)).filter((name) => pattern.test(name))
  } catch {
    return []
  }
}

const globToRegExp = (glob) => new RegExp('^' + glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$')

function readText(path) {
  try { return readFileSync(path, 'utf8') } catch { return '' }
}

export function readLedger(dir) {
  const path = join(dir, 'sources.jsonl')
  if (!existsSync(path)) return { exists: false, rows: [], errors: [] }
  const errors = []
  const rows = []
  const seen = new Set()
  readText(path).split('\n').forEach((line, index) => {
    const text = line.trim()
    if (!text) return
    let row = null
    try { row = JSON.parse(text) } catch { errors.push('第 ' + (index + 1) + ' 行不是合法 JSON'); return }
    for (const field of LEDGER_FIELDS) if (!row[field]) errors.push('第 ' + (index + 1) + ' 行缺 ' + field)
    if (row.kind && LEDGER_KINDS.indexOf(row.kind) < 0) errors.push('第 ' + (index + 1) + ' 行 kind 不认识：' + row.kind)
    if (row.availability && LEDGER_AVAILABILITY.indexOf(row.availability) < 0) errors.push('第 ' + (index + 1) + ' 行 availability 不认识：' + row.availability)
    if (row.read_level && LEDGER_READ.indexOf(row.read_level) < 0) errors.push('第 ' + (index + 1) + ' 行 read_level 不认识：' + row.read_level)
    if (row.id && seen.has(row.id)) errors.push('id 重复：' + row.id)
    if (row.id) seen.add(row.id)
    rows.push(row)
  })
  return { exists: true, rows, errors }
}

const STEPS = [
  { id: 'plan', label: '计划', path: '00-plan.md', required: true },
  { id: 'cards', label: '卡片', path: '01-cards/*.md', required: false },
  { id: 'findings', label: '研究员交付', path: '02-findings/*.md', required: true },
  { id: 'conclusion', label: '结论', path: '03-conclusion/v*.md', required: true },
  { id: 'redteam', label: '红队', path: '04-red-team/*.md', required: true },
  { id: 'dispose', label: '处置', path: '05-dispose.md', required: true },
  { id: 'divergence', label: '分歧审查', path: '06-divergence/*.md', required: true },
  { id: 'ledger', label: '来源账本', path: 'sources.jsonl', required: true },
  { id: 'gaps', label: '缺口', path: 'gaps.md', required: true },
]

/** Every audit is a reading of the directory as it stands, never a score. */
export function auditResearch(dir, options) {
  const strict = Boolean(options && options.strict)
  const steps = []
  const missing = []
  const advisories = []
  for (const step of STEPS) {
    let present = false
    let count = 0
    if (step.path.indexOf('*') >= 0) {
      const slash = step.path.indexOf('/')
      const names = filesIn(dir, step.path.slice(0, slash), globToRegExp(step.path.slice(slash + 1)))
      count = names.length
      present = names.length > 0
    } else {
      present = existsSync(join(dir, step.path))
      count = present ? 1 : 0
    }
    steps.push({ id: step.id, label: step.label, path: step.path, present, count, required: step.required })
    if (step.required && !present) missing.push(step.label)
    if (!step.required && !present) advisories.push({ level: 'info', text: '没有卡片目录 ' + step.path + '，卡片可能写在计划里；不影响结论' })
  }

  const ledger = readLedger(dir)
  for (const error of ledger.errors) advisories.push({ level: 'warn', text: '账本：' + error })
  if (ledger.exists && ledger.rows.length === 0) advisories.push({ level: 'warn', text: '账本是空的' })

  const conclusionNames = filesIn(dir, '03-conclusion', /^v.*\.md$/)
  if (conclusionNames.length) {
    const text = conclusionNames.map((name) => readText(join(dir, '03-conclusion', name))).join('\n')
    const hits = (text.match(new RegExp(LOCATOR.source, 'g')) || []).length
    if (hits === 0) advisories.push({ level: 'warn', text: '结论里没有一处定位符：页码、段落号、时间码或带日期的链接' })
    if (!/反证|竞争解释|不利材料/.test(text)) advisories.push({ level: 'warn', text: '结论里没有反证或竞争解释一节' })
    if (!/局限|不确定|证据不足/.test(text)) advisories.push({ level: 'warn', text: '结论里没有写方法局限' })
  }

  const planText = readText(join(dir, '00-plan.md'))
  if (planText && !/停止条件/.test(planText)) advisories.push({ level: 'info', text: '计划里没写停止条件：什么情况下算查够了' })
  if (planText && !/覆盖表|Coverage/.test(planText)) advisories.push({ level: 'info', text: '计划里没有覆盖表，空白无法变成声明' })

  const redNames = filesIn(dir, '04-red-team', /\.md$/)
  for (const name of redNames) {
    const text = readText(join(dir, '04-red-team', name))
    if (!/kind:/.test(text)) advisories.push({ level: 'warn', text: '红队文件 ' + name + ' 没有按 issues 格式写（缺 kind:）' })
    if (!/priority:/.test(text)) advisories.push({ level: 'warn', text: '红队文件 ' + name + ' 没有标优先级（缺 priority:）' })
  }

  const disposeText = readText(join(dir, '05-dispose.md'))
  if (disposeText && !/(revise|rebut|concede|covered|park|branch)/.test(disposeText)) {
    advisories.push({ level: 'warn', text: '处置文件里没有六种处置之一：revise 重做、rebut 反驳、concede 认账、covered 已覆盖、park 留待、branch 分叉' })
  }

  const warnings = advisories.filter((row) => row.level === 'warn')
  const ok = missing.length === 0 && (!strict || warnings.length === 0)
  return {
    ok,
    dir,
    strict,
    steps,
    missing,
    advisories,
    ledger: { exists: ledger.exists, rows: ledger.rows.length, errors: ledger.errors.length },
  }
}
