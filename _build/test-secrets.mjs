/**
 * Repository hygiene: no tokens, keys or local home paths in tracked files.
 * Runs before a release, and stays useful afterwards.
 */
import { readFileSync } from 'node:fs'
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
console.log('tracked_files=' + files.length + ' hits=' + hits.length)
for (const hit of hits.slice(0, 20)) console.log('  ' + hit)
process.exit(hits.length ? 1 : 0)
