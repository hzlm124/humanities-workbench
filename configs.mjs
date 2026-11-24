/**
 * Config sets: one JSON per set under ~/.dsh/humanities-workbench/configs.
 * A set names the skill directory, the subtitle corpus and which sections show.
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { defaultSkillDir, defaultSubsDir, neutralSkillDir } from './data.mjs'

export const ROOT = join(homedir(), '.dsh', 'humanities-workbench')
export const CONFIG_DIR = join(ROOT, 'configs')

export const ALL_TABS = ['overview', 'facts', 'tensions', 'rules', 'redlines', 'refs', 'terms']

const seed = (id, name, skillDir, note, tabs = ALL_TABS) => ({
  id, name, skillDir, subsDir: defaultSubsDir(), tabs, note,
})

const SEEDS = [
  seed('default', '默认配置', neutralSkillDir(),
    '通用方法论与空白画像模板，不含个人立场。填 profile.md 后即成自定义版本。'),
]

function fileOf(id) {
  return join(CONFIG_DIR, id + '.json')
}

export function writeConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(fileOf(config.id), JSON.stringify(config, null, 2) + '\n', 'utf8')
  return config
}

export function readConfig(id) {
  try {
    const raw = readFileSync(fileOf(id), 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.id !== 'string') return null
    return { ...parsed, tabs: Array.isArray(parsed.tabs) && parsed.tabs.length ? parsed.tabs : ALL_TABS }
  } catch {
    return null
  }
}

export function listConfigs() {
  mkdirSync(CONFIG_DIR, { recursive: true })
  const names = readdirSync(CONFIG_DIR).filter((n) => n.endsWith('.json'))
  if (!names.length) {
    const stamp = new Date().toISOString()
    for (const seed of SEEDS) {
      writeFileSync(fileOf(seed.id), JSON.stringify({ ...seed, updatedAt: stamp }, null, 2) + '\n', 'utf8')
    }
  }
  const out = []
  for (const name of readdirSync(CONFIG_DIR).filter((n) => n.endsWith('.json'))) {
    const parsed = readConfig(name.replace(/\.json$/, ''))
    if (parsed) out.push(parsed)
  }
  out.sort((a, b) => (a.id === 'default' ? -1 : b.id === 'default' ? 1 : a.id.localeCompare(b.id)))
  return out
}

export function resolveConfig(id) {
  const list = listConfigs()
  if (!id) return list[0] || null
  return list.find((c) => c.id === id) || list[0] || null
}

export function configStatus(config) {
  const dir = config && config.skillDir
  return {
    skillDirExists: Boolean(dir && existsSync(dir)),
    profileExists: Boolean(dir && existsSync(join(dir, 'profile', 'profile.md'))),
    rulesExists: Boolean(dir && existsSync(join(dir, 'profile', 'rules.md'))),
  }
}
