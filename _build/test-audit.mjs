/**
 * Audit, graph and the two shipped scripts, exercised on real files in a
 * temporary directory that is removed before exit.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { auditResearch, readLedger } from '../audit.mjs'
import { emptyGraph, addNode, converge, closeNode, graphStatus, loadGraph, saveGraph } from '../graph.mjs'

const root = mkdtempSync(join(tmpdir(), 'hw-audit-'))
const checks = []
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail: detail === undefined ? '' : String(detail) })
const write = (rel, body) => { const full = join(root, rel); mkdirSync(join(full, '..'), { recursive: true }); writeFileSync(full, body, 'utf8') }

try {
  const blank = auditResearch(root)
  check('empty dir reports missing', blank.ok === false && blank.missing.length === 8, blank.missing.join('/'))

  write('00-plan.md', '# plan\n\n## 覆盖表\n\n| a | b |\n\n停止条件：三条来源互证。\n')
  write('01-cards/C01.md', 'id: C01\n')
  write('02-findings/C01.md', 'S001 说，某事发生在 1992-09-12。\n')
  write('03-conclusion/v1.md', '# 结论\n\n## 关键证据\n\n- 某事发生于 1992-09-12（S001，p. 12）。\n\n## 反证与竞争解释\n\n无。\n\n## 方法局限\n\n只有一份材料。\n')
  write('04-red-team/R1.md', 'kind: fact\npriority: high\nquestion: 日期对吗\n')
  write('05-dispose.md', 'R1 revise：回原件核对。\n')
  write('06-divergence/D1.md', '未取之路：另一条线没走。\n')
  write('gaps.md', '- gap: 缺一份档案\n')
  write('sources.jsonl', JSON.stringify({ id: 'S001', title: '某档案', kind: 'archive', locator: 'p. 12', availability: 'open', read_level: 'full' }) + '\n')

  const full = auditResearch(root)
  check('complete dir passes', full.ok === true && full.missing.length === 0, 'missing=' + full.missing.join('/'))
  check('ledger read', full.ledger.rows === 1 && full.ledger.errors === 0, JSON.stringify(full.ledger))
  check('no blocker advisories', full.advisories.filter((row) => row.level === 'warn').length === 0, JSON.stringify(full.advisories))

  write('sources.jsonl', JSON.stringify({ id: 'S001', title: '某档案', kind: 'archive', locator: '', availability: 'open', read_level: 'full' }) + '\n' + 'not json\n')
  const strict = auditResearch(root, { strict: true })
  check('bad ledger fails strict', strict.ok === false && strict.ledger.errors >= 2, 'errors=' + strict.ledger.errors)
  check('bad ledger reported', readLedger(root).errors.length >= 2)

  write('03-conclusion/v1.md', '# 结论\n\n没有定位符也没有反证。\n')
  const thin = auditResearch(root)
  check('thin conclusion warns', thin.advisories.some((row) => row.text.indexOf('定位符') >= 0), JSON.stringify(thin.advisories.map((r) => r.text)))

  const goodLedger = join(root, 'good.jsonl')
  writeFileSync(goodLedger, JSON.stringify({ id: 'S001', title: 't', kind: 'book', locator: 'p. 3', availability: 'open', read_level: 'full' }) + '\n', 'utf8')
  const badLedger = join(root, 'bad.jsonl')
  writeFileSync(badLedger, JSON.stringify({ id: 'S001', title: 't' }) + '\n', 'utf8')
  const py = 'skill/scripts/check_ledger.py'
  const okRun = spawnSync('python', [py, goodLedger, '--json'], { encoding: 'utf8' })
  const badRun = spawnSync('python', [py, badLedger], { encoding: 'utf8' })
  check('check_ledger passes good', okRun.status === 0, (okRun.stdout || '').slice(0, 80))
  check('check_ledger fails bad', badRun.status === 1 && /missing/.test(badRun.stdout || ''), (badRun.stdout || '').slice(0, 120))

  const bookDir = join(root, 'books')
  mkdirSync(bookDir, { recursive: true })
  const build = spawnSync('python', ['-c', 'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1],"w"); z.writestr("OEBPS/c1.xhtml","<html><body><p>第一章 正文</p></body></html>"); z.writestr("OEBPS/c2.xhtml","<html><body><p>第二章 续</p></body></html>"); z.close()', join(bookDir, 'sample.epub')], { encoding: 'utf8' })
  check('epub fixture built', build.status === 0 && existsSync(join(bookDir, 'sample.epub')), (build.stderr || '').slice(0, 120))
  const ingest = spawnSync('python', ['skill/scripts/book_ingest.py', join(bookDir, 'sample.epub'), '--json'], { encoding: 'utf8' })
  const report = ingest.status === 0 ? JSON.parse(ingest.stdout) : {}
  check('book_ingest reads epub', ingest.status === 0 && report.chars > 0 && report.format === 'epub', (ingest.stdout || ingest.stderr || '').slice(0, 120))
  check('book_ingest writes text', report.out && readFileSync(report.out, 'utf8').indexOf('第一章') >= 0)
  const pdfLike = join(bookDir, 'scan.pdf')
  writeFileSync(pdfLike, '%PDF-1.4\n', 'utf8')
  const scan = spawnSync('python', ['skill/scripts/book_ingest.py', pdfLike, '--json'], { encoding: 'utf8' })
  const scanReport = scan.status === 0 ? JSON.parse(scan.stdout) : {}
  check('scanned pdf flagged needs_ocr', scan.status === 0 && scanReport.needs_ocr === true, (scan.stdout || scan.stderr || '').slice(0, 160))

  const graph = emptyGraph('怎么会发生', { maxDepth: 2 })
  const rootNode = addNode(graph, { question: '怎么会发生' })
  check('graph root', rootNode.ok && rootNode.node.level === 0, rootNode.error || '')
  const secondRoot = addNode(graph, { question: '另一棵树' })
  check('graph refuses second root', secondRoot.ok === false, secondRoot.error || '')
  const fork = addNode(graph, { question: '为何是此时', parent: rootNode.node.id, premise: '前提不同：时间点由外部冲击决定' })
  check('graph fork', fork.ok && fork.node.level === 1, fork.error || '')
  const shortPremise = addNode(graph, { question: '另一支', parent: rootNode.node.id, premise: '短' })
  check('graph needs a premise', shortPremise.ok === false, shortPremise.error || '')
  const dup = addNode(graph, { question: '为何是此时？', parent: rootNode.node.id, premise: '前提不同：写法不同但问题一样' })
  check('graph dedupes', dup.ok === false && dup.duplicateOf === fork.node.id, dup.error || '')
  const conv = converge(graph, { from: [rootNode.node.id, fork.node.id], question: '两条线怎么并' })
  check('graph converge', conv.ok && conv.node.from.length === 2, conv.error || '')
  check('graph close', closeNode(graph, conv.node.id, 'done').ok === true)
  const status = graphStatus(graph)
  check('graph status counts', status.nodes === 3 && status.convergence === 1 && status.done === 1 && status.skipped === 1, JSON.stringify(status.byLevel))
  saveGraph(join(root, 'graphdir'), graph)
  check('graph persists', loadGraph(join(root, 'graphdir')).nodes.length === 3)
  const deep = emptyGraph('根', { maxDepth: 1 })
  const d0 = addNode(deep, { question: '根' })
  const d1 = addNode(deep, { question: '一层', parent: d0.node.id, premise: '前提不同：换了一个尺度' })
  const d2 = addNode(deep, { question: '二层', parent: d1.node.id, premise: '前提不同：再换一个尺度' })
  check('graph depth limit', d1.ok && d2.ok === false && /深度/.test(d2.error || ''), d2.error || '')
} finally {
  try { rmSync(root, { recursive: true, force: true }) } catch { /* windows lock */ }
}

const failed = checks.filter((row) => !row.ok)
for (const row of checks) process.stdout.write((row.ok ? 'ok   ' : 'FAIL ') + row.name + (row.detail ? '  [' + row.detail + ']' : '') + '\n')
process.stdout.write('\n' + (checks.length - failed.length) + '/' + checks.length + ' passed\n')
process.stdout.write('temp removed=' + !existsSync(root) + '\n')
process.exit(failed.length ? 1 : 0)
