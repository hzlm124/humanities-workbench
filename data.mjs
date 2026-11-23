/**
 * Reads the humanities-research skill on every request, so the panel never
 * shows a stale snapshot. Pure data: no DSH services, no side effects.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

/** The reference set that ships inside this package. */
export function bundledSkillDir() {
  return fileURLToPath(new URL('./skill/', import.meta.url)).replace(/[\\/]+$/, '')
}

/** Default set: the bundled one when present, else a set under the home directory. */
export function defaultSkillDir() {
  const bundled = bundledSkillDir()
  if (existsSync(join(bundled, 'references'))) return bundled
  return join(homedir(), '.dsh', 'skills', 'humanities-research-neutral')
}

/** A personal set, if the user keeps one. */
export function personalSkillDir() {
  return join(homedir(), '.dsh', 'skills', 'humanities-research')
}

export function neutralSkillDir() {
  return defaultSkillDir()
}

/** Subtitle corpus directory; configured per install, empty by default. */
export function defaultSubsDir() {
  return ''
}

const EMPTY_PANEL = { thesis: '', chain: [], boundary: [], facts: [], inferences: [], tensions: [], redlines: [], redlineNote: '', sections: [] }

/** Neutral section labels; a skill set may override any of them in panel.json. */
const DEFAULT_HEADINGS = {
  chain: '条件链（结构性必要条件，非历史保证）',
  facts: '事实依赖结构',
  inferences: '硬约束',
  tensions: '未解张力',
  rules: '执行规则 {n}',
  redlines: '红线',
  refs: '方法论参考册',
}

const DEFAULT_METHOD_NOTE = '结论只写「在什么情势下、由谁抉择、有多大可能」，不写「必然走向」。'

/** Panel content lives with the skill set, not in code. */
function readPanel(skillDir) {
  try {
    const parsed = JSON.parse(readFileSync(join(skillDir, 'profile', 'panel.json'), 'utf8'))
    return { ...EMPTY_PANEL, ...parsed }
  } catch {
    return EMPTY_PANEL
  }
}

/** The optional custom-frontend block a skill set may carry. */
export function panelFrontend(skillDir) {
  const panel = readPanel(skillDir)
  return panel.frontend || null
}

function readText(path) {
  try { return readFileSync(path, 'utf8') } catch { return '' }
}

function parseRules(text) {
  const out = []
  const re = /^## (R\d+)[·\s]*(.*?)\n+([\s\S]*?)(?=^## |$(?![\s\S]))/gm
  let m
  while ((m = re.exec(text)) !== null) {
    const rid = m[1]
    const title = (m[2] || '').trim()
    const lines = m[3].split('\n')
      .map((x) => x.trim())
      .filter((x) => x && !x.startsWith('```'))
    let detail = lines.slice(0, 3).join(' / ')
    if (detail.length > 230) detail = detail.slice(0, 228) + '…'
    out.push([rid, title, detail])
  }
  return out
}

function parseRefs(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
    const text = readText(join(dir, name))
    if (!text) continue
    const title = (text.split('\n')[0] || '').replace(/^#+\s*/, '').trim()
    let first = ''
    for (const line of text.split('\n').slice(1)) {
      const s = line.trim()
      if (s && !s.startsWith('>') && !s.startsWith('#')) { first = s; break }
    }
    out.push([name, title, first.slice(0, 150)])
  }
  return out
}

export function buildData(options = {}) {
  const skillDir = options.skillDir || defaultSkillDir()
  const panel = readPanel(skillDir)
  const profile = readText(join(skillDir, 'profile', 'profile.md'))
  const rules = readText(join(skillDir, 'profile', 'rules.md'))
  const parsedRules = parseRules(rules)
  const refs = parseRefs(join(skillDir, 'references'))
  const now = new Date()

  const heads = { ...DEFAULT_HEADINGS, ...(panel.headings || {}) }

  let subs = 0
  const subsPath = options.subsDir || defaultSubsDir()
  if (subsPath && existsSync(subsPath)) {
    try { subs = readdirSync(subsPath).filter((n) => n.endsWith('.srt')).length } catch { subs = 0 }
  }

  return {
    source: 'live',
    generatedAt: now.toISOString(),
    meta: {
      subtitle: '实时数据 · 规则 ' + parsedRules.length + ' 条 · 红线 ' + panel.redlines.length + ' 条 · 参考册 ' + refs.length +
        ' · 读取于 ' + now.toLocaleString('zh-CN', { hour12: false }),
      foot: '本页每次打开（或点「刷新」）都直接读取 ' + skillDir + ' 与字幕目录，不再需要重新构建。' +
        '页面不写会话日志，也不改动任何 profile 状态。',
      headings: {
        chain: heads.chain,
        facts: heads.facts,
        inferences: heads.inferences,
        tensions: heads.tensions,
        rules: heads.rules.replace('{n}', 'R1–R' + parsedRules.length),
        redlines: heads.redlines,
        refs: heads.refs,
      },
    },
    thesis: panel.thesis,
    kpi: [
      [String(panel.tensions.length), '张力'],
      [String(panel.facts.length), '事实'],
      [String(parsedRules.length), '规则'],
      [String(panel.redlines.length), '红线'],
    ],
    chain: panel.chain,
    boundary: panel.boundary,
    overdetermination: panel.overdetermination || DEFAULT_METHOD_NOTE,
    facts: panel.facts,
    inferences: panel.inferences,
    tensions: panel.tensions,
    rules: parsedRules,
    redlines: panel.redlines,
    redlineNote: panel.redlineNote,
    sections: Array.isArray(panel.sections) ? panel.sections : [],
    frontend: panel.frontend || null,
    materials: [[String(subs), '字幕文件'], [String(refs.length), '参考册']],
    refs,
    profileBytes: profile.length,
  }
}
