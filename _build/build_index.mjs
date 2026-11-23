/** Build the corpus index from a subtitle directory. */
import { buildCorpus, saveCorpus, corpusStatus } from '../knowledge.mjs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const subsDir = process.argv[2] || process.env.HW_SUBS_DIR || ''
if (!subsDir) {
  console.error('用法：node _build/build_index.mjs <字幕目录>')
  process.exit(2)
}
const target = process.argv[3] || join(homedir(), '.dsh', 'humanities-workbench', 'corpus.json')
const corpus = buildCorpus(subsDir)
saveCorpus(target, corpus)
const status = corpusStatus(target, subsDir)
console.log('index -> ' + target)
console.log('files=' + corpus.stats.files + ' segments=' + corpus.stats.segments + ' chars=' + corpus.stats.chars)
console.log('builtAt=' + corpus.builtAt + ' stale=' + status.stale)
