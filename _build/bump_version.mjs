/** Set the package version once, so every file that reads it agrees. */
import { readFileSync, writeFileSync } from 'node:fs'

const file = new URL('../package.json', import.meta.url)
const target = String(process.argv[2] || '').trim()
if (!/^\d+\.\d+\.\d+$/.test(target)) {
  console.error('usage: node _build/bump_version.mjs <major.minor.patch>')
  process.exit(2)
}
const pkg = JSON.parse(readFileSync(file, 'utf8'))
const before = pkg.version
pkg.version = target
writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
console.log('version ' + before + ' -> ' + pkg.version)
