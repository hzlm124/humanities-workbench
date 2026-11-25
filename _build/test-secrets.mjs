/**
 * Repository hygiene: no tokens, keys or local home paths in tracked files.
 * Runs before a release, and stays useful afterwards.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execSync } from 'node:child_process'

const files = execSync('git ls-files', { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean)
const secretPatterns = [
  [/ghp_[A-Za-z0-9]{20,}/, 'github classic token'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'github fine-grained token'],
  [/sk-[A-Za-z0-9]{20,}/, 'openai style key'],
  [/AKIA[0-9A-Z]{16}/, 'aws key id'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
]
const pathPatterns = [
  [/C:\\Users\\[A-Za-z0-9_.-]+\\(?!\\.dsh\\attachments)/, 'absolute user home path'],
]
const hits = []
for (const file of files) {
  let text = ''
  try { text = readFileSync(file, 'utf8') } catch { continue }
  if (text.indexOf('\u0000') >= 0) continue
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(text)) hits.push(label + ' in ' + file)
  }
  for (const [pattern, label] of pathPatterns) {
    if (pattern.test(text)) hits.push(label + ' in ' + file)
  }
}

/**
 * A personal skill set must never reach the repository: the built bundle once
 * carried the owner's own framework as an offline snapshot. Any panel text from
 * ~/.dsh/skills/humanities-research is a leak, wherever it appears.
 */
const personalPanel = join(homedir(), '.dsh', 'skills', 'humanities-research', 'profile', 'panel.json')
const bundledPanel = readFileSync(new URL('../skill/profile/panel.json', import.meta.url), 'utf8')
const personalProbes = []
try {
  const panel = JSON.parse(readFileSync(personalPanel, 'utf8'))
  // Only what the personal set adds: shared method text legitimately ships in skill/.
  const push = (value) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim()
    if (text.length < 10) return
    if (bundledPanel.indexOf(text.slice(0, 14)) >= 0) return
    personalProbes.push(text.slice(0, 14))
  }
  push(panel.thesis)
  for (const row of panel.redlines || []) push(Array.isArray(row) ? row[1] : row)
  for (const row of panel.tensions || []) push(Array.isArray(row) ? row[1] : row)
  for (const row of panel.rules || []) push(Array.isArray(row) ? row[1] : row)
} catch { /* no personal set on this machine */ }
const leaked = []
for (const file of files) {
  let text = ''
  try { text = readFileSync(file, 'utf8') } catch { continue }
  if (text.indexOf('\u0000') >= 0) continue
  for (const probe of personalProbes) {
    if (text.indexOf(probe) >= 0) leaked.push('personal-only text in ' + file + ' :: ' + probe)
  }
}

console.log('tracked_files=' + files.length + ' personal_only_probes=' + personalProbes.length + ' leaks=' + leaked.length + ' hits=' + hits.length)
for (const hit of hits.concat(leaked).slice(0, 20)) console.log('  ' + hit)
process.exit(hits.length || leaked.length ? 1 : 0)