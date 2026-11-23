import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { assertFetchable, isPrivateIp, readPages, htmlToText, srtToText, readTextFile, bilibiliTranscript } from '../tools.mjs'

const bad = ['http://127.0.0.1/', 'http://localhost:8080/x', 'http://169.254.169.254/latest/meta-data/',
  'http://10.0.0.5/', 'http://192.168.1.1/', 'http://172.20.3.4/', 'http://[::1]/', 'http://metadata.google.internal/']
for (const url of bad) {
  await assert.rejects(() => assertFetchable(url), /内网|解析/, 'should reject ' + url)
}
assert.equal(isPrivateIp('8.8.8.8'), false)
assert.equal(isPrivateIp('100.64.1.1'), true)
await assertFetchable('https://example.com/')

const urls = ['http://127.0.0.1/', 'http://localhost/', 'http://169.254.169.254/']
const pages = await readPages(urls)
assert.equal(pages.length, 3)
pages.forEach((p, i) => assert.equal(p.url, urls[i], 'order kept at ' + i))
assert.ok(pages.every((p) => p.error), 'all three blocked')

assert.equal(htmlToText('<p>甲</p><script>x()</script><p>乙</p>'), '甲\n\n乙')
assert.equal(srtToText('1\n00:00:01,000 --> 00:00:02,000\n你好\n\n2\n00:00:03,000 --> 00:00:04,000\n世界'), '你好世界')

const dir = mkdtempSync(join(tmpdir(), 'hw-subs-'))
const gbkText = '第一句。第二句。'
const gbkBytes = Buffer.from([0xB5, 0xDA, 0xD2, 0xBB, 0xBE, 0xE4, 0xA1, 0xA3, 0xB5, 0xDA, 0xB6, 0xFE, 0xBE, 0xE4, 0xA1, 0xA3])
writeFileSync(join(dir, 'BV1xx411c7mD.srt'), gbkBytes)
const decoded = readTextFile(join(dir, 'BV1xx411c7mD.srt'))
assert.equal(decoded, gbkText, 'gbk decoded: ' + decoded)
const tr = bilibiliTranscript('BV1xx411c7mD', dir)
assert.equal(tr.found, true)
assert.ok(tr.text.includes('第一句'), 'transcript text: ' + tr.text)

console.log('tools tests OK')
