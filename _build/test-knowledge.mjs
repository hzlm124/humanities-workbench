import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseSrt, segmentsFromCues, buildCorpus, search, tokenize, clock, saveCorpus, loadCorpus, corpusStatus } from '../knowledge.mjs'

const srt = [
  '1',
  '00:00:01,000 --> 00:00:04,000',
  '生产资料的所有制决定了剩余如何被抽取，',
  '',
  '2',
  '00:00:04,000 --> 00:00:07,500',
  '这是分析的第一步，不能跳过。',
  '',
  '3',
  '01:02:03,000 --> 01:02:06,000',
  '第二段讲证据分级：一手材料优先。',
  '',
].join('\n')

const cues = parseSrt(srt)
assert.equal(cues.length, 3)
assert.equal(cues[0].start, 1)
assert.equal(cues[2].start, 3723)
assert.equal(clock(3723), '1:02:03')

const segs = segmentsFromCues(cues)
assert.ok(segs.length >= 1, 'segments produced')
assert.equal(segs[0].start, 1)

const dir = mkdtempSync(join(tmpdir(), 'hw-corpus-'))
writeFileSync(join(dir, 'BVaabbccddee.srt'), srt, 'utf8')
const gbkBytes = Buffer.from([
  0xD6, 0xA4, 0xBE, 0xDD, 0xB7, 0xD6, 0xBC, 0xB6, 0xD4, 0xDA, 0xB5, 0xDA, 0xB6, 0xFE, 0xB2, 0xE1, 0xB5, 0xC4, 0xB7, 0xBD,
  0xB7, 0xA8, 0xD2, 0xB3, 0xC0, 0xEF, 0xBD, 0xB2, 0xB5, 0xC3, 0xBA, 0xDC, 0xC7, 0xE5, 0xB3, 0xFE, 0xA3, 0xAC, 0xD2, 0xBB,
  0xCA, 0xD6, 0xB2, 0xC4, 0xC1, 0xCF, 0xD3, 0xC5, 0xCF, 0xC8, 0xD3, 0xDA, 0xD7, 0xAA, 0xCA, 0xF6, 0xA1, 0xA3,
])
writeFileSync(join(dir, 'BV1122334455.srt'), Buffer.concat([
  Buffer.from('1\n00:00:01,000 --> 00:00:04,000\n', 'utf8'),
  gbkBytes,
  Buffer.from('\n', 'utf8'),
]), 'binary')
writeFileSync(join(dir, 'notes.txt'), '红队复查要求独立复现；分歧审查要写清双方证据与反驳，并标明每个判断的来源层级。', 'utf8')

const corpus = buildCorpus(dir)
assert.equal(corpus.stats.files, 3)
assert.ok(corpus.stats.segments >= 3, 'segments across three files: ' + corpus.stats.segments)

const gbkHit = search(corpus, '证据分级', 3)
assert.ok(gbkHit.length > 0, 'gbk file is searchable')
assert.equal(gbkHit[0].bvid, 'BV1122334455')
assert.ok(gbkHit[0].text.includes('一手材料'), 'gbk decoded correctly: ' + gbkHit[0].text)

const top = search(corpus, '生产资料 所有制', 3)
assert.ok(top.length > 0)
assert.equal(top[0].bvid, 'BVaabbccddee')
assert.equal(top[0].at, '00:01')

assert.equal(search(corpus, '量子色动力学', 3).length, 0)

const path = join(dir, 'corpus.json')
saveCorpus(path, corpus)
const back = loadCorpus(path)
assert.equal(back.stats.segments, corpus.stats.segments)
assert.equal(tokenize('').length, 0)
const status = corpusStatus(path, dir)
assert.equal(status.exists, true)

console.log('knowledge tests OK, segments=' + corpus.stats.segments)
