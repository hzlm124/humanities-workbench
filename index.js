/**
 * Host half: panel data routes plus the reader tools.
 */
import { mkdirSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { buildData } from './data.mjs'
import { listConfigs, resolveConfig, configStatus, writeConfig, ALL_TABS, ROOT } from './configs.mjs'
import { mkdirSync as mkdir, writeFileSync } from 'node:fs'
import { readPage, readPages, wikiExtract, bilibiliTranscript } from './tools.mjs'
import { buildCorpus, loadCorpus, saveCorpus, search as searchCorpus, corpusStatus, clock } from './knowledge.mjs'

export const DATA_PATH = '/humanities-workbench/data.json'
export const CONFIGS_PATH = '/humanities-workbench/configs.json'
export const IMPORT_PATH = '/humanities-workbench/import'
export const CORPUS_PATH = '/humanities-workbench/corpus.json'
export const CORPUS_FILE = join(homedir(), '.dsh', 'humanities-workbench', 'corpus.json')
export const inject = ['webServer', 'tools']

const CACHE_MS = 1500
const BOOT_LOG = join(homedir(), '.dsh', 'humanities-workbench', 'boot.log')

function note(line) {
  try {
    mkdirSync(dirname(BOOT_LOG), { recursive: true })
    appendFileSync(BOOT_LOG, new Date().toISOString() + ' ' + line + '\n')
  } catch { /* best effort */ }
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

const asText = (value) => [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 1) }]
const output = { schema: { type: 'string' }, render: (args, value) => asText(value) }

function subsDirOf(base) {
  if (base && base.subsDir) return base.subsDir
  const chosen = resolveConfig()
  return (chosen && chosen.subsDir) || ''
}

let corpusCache = null

/** Load the corpus index, rebuilding it when the subtitle directory changed. */
const sameDir = (a, b) => String(a || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase() ===
  String(b || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()

export function corpusFor(subsDir, force = false) {
  const status = corpusStatus(CORPUS_FILE, subsDir)
  const usable = (c) => Boolean(c) && (!subsDir || sameDir(c.subsDir, subsDir))
  const cached = corpusCache && corpusCache.path === CORPUS_FILE ? corpusCache.data : null
  if (!force && cached && !status.stale && usable(cached)) return cached
  if (!force && !status.stale) {
    const loaded = loadCorpus(CORPUS_FILE)
    if (usable(loaded)) { corpusCache = { path: CORPUS_FILE, data: loaded }; return loaded }
  }
  if (!subsDir) return null
  try {
    const built = buildCorpus(subsDir)
    saveCorpus(CORPUS_FILE, built)
    corpusCache = { path: CORPUS_FILE, data: built }
    return built
  } catch {
    return null
  }
}

function registerTools(ctx, options) {
  const subsDir = () => options.subsDir || (resolveConfig() || {}).subsDir

  ctx.effect(() => ctx.tools.register({
    name: 'hw_page',
    description: '读取网页正文文本。返回标题、状态码、正文（已去标签与脚本）。知乎、Z-Library 等需要登录的站点，若 ~/.dsh/humanities-workbench/cookies.json 里有该域名的 cookie 会自动带上。',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: '网页地址，可省略 https://' },
        maxChars: { type: 'number', description: '正文上限，默认 12000，最大 40000' },
      },
      required: ['url'],
      additionalProperties: false,
    },
    output,
    async execute(args) {
      return JSON.stringify(await readPage(String(args.url), { maxChars: args.maxChars }))
    },
  }), 'humanities-workbench: hw_page')

ctx.effect(() => ctx.tools.register({
    name: 'hw_batch',
    description: '批量读取多个网页正文，最多 8 个，并发 3。单个失败只影响自己那一项。',
    parameters: {
      type: 'object',
      properties: {
        urls: { type: 'array', items: { type: 'string' }, description: '网页地址列表，最多 8 个' },
        maxChars: { type: 'number', description: '每个页面正文上限，默认 6000' },
      },
      required: ['urls'],
      additionalProperties: false,
    },
    output,
    async execute(args) {
      const pages = await readPages(args.urls, { maxChars: args.maxChars || 6000 })
      return JSON.stringify(pages)
    },
  }), 'humanities-workbench: hw_batch')

  ctx.effect(() => ctx.tools.register({
    name: 'hw_wiki',
    description: '取维基百科条目的纯文本摘要。默认中文维基，可指定语言。',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '条目名或搜索词' },
        lang: { type: 'string', description: '语言代码，默认 zh；英文用 en' },
        maxChars: { type: 'number', description: '正文字数上限，默认 6000' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    output,
    async execute(args) {
      return JSON.stringify(await wikiExtract(String(args.query), args.lang || 'zh', args.maxChars))
    },
  }), 'humanities-workbench: hw_wiki')

  ctx.effect(() => ctx.tools.register({
    name: 'hw_bilibili',
    description: '按 BV 号取 B 站视频的 CC 字幕文本，来自本地字幕库。',
    parameters: {
      type: 'object',
      properties: {
        bvid: { type: 'string', description: 'BV 号或含 BV 号的字符串' },
        maxChars: { type: 'number', description: '正文字数上限，默认 12000' },
      },
      required: ['bvid'],
      additionalProperties: false,
    },
    output,
    async execute(args) {
      return JSON.stringify(bilibiliTranscript(String(args.bvid), subsDir(), args.maxChars))
    },
  }), 'humanities-workbench: hw_bilibili')
}

export function apply(ctx, config) {
  note('apply')
  const base = config && typeof config === 'object' ? config : {}
  let cache = null

  const payload = (id) => {
    const chosen = resolveConfig(id)
    const skillDir = base.skillDir || (chosen && chosen.skillDir)
    const subsDir = base.subsDir || (chosen && chosen.subsDir)
    const key = (id || '') + '|' + (skillDir || '') + '|' + (subsDir || '')
    const now = Date.now()
    if (cache && cache.key === key && now - cache.at < CACHE_MS) return cache.body
    const data = buildData({ skillDir, subsDir })
    const corpusState = corpusStatus(CORPUS_FILE, subsDir)
    const body = {
      ...data,
      config: chosen ? { id: chosen.id, name: chosen.name, tabs: chosen.tabs, note: chosen.note } : null,
      status: configStatus({ skillDir }),
      corpus: corpusState.exists
        ? { ready: true, stale: corpusState.stale, segments: (loadCorpus(CORPUS_FILE) || { stats: {} }).stats.segments || 0 }
        : { ready: false, stale: corpusState.stale, segments: 0 },
    }
    cache = { key, at: now, body }
    return body
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: DATA_PATH,
    resource: async (request) => {
      const id = new URL(request.url).searchParams.get('config') || undefined
      return json(payload(id))
    },
  }), 'humanities-workbench: data')


  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: IMPORT_PATH,
    handler: (req, res) => {
      const send = (code, body) => {
        res.statusCode = code
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(body))
      }
      if (req.method !== 'POST') return send(405, { error: 'POST only' })
      const chunks = []
      let size = 0
      let aborted = false
      req.on('data', (chunk) => {
        if (aborted) return
        chunks.push(chunk)
        size += chunk.length
        if (size > 2000000) {
          aborted = true
          send(413, { error: '导入文件超过 2 MB 上限，已中止' })
          req.destroy()
        }
      })
      req.on('end', () => {
        if (aborted) return
        try {
          const { filename, text } = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          const safe = String(filename || 'import.txt').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
          let parsed = null
          try { parsed = JSON.parse(String(text)) } catch { parsed = null }
          if (parsed && typeof parsed === 'object' && (parsed.skillDir || parsed.tabs || parsed.skillRoot)) {
            const id = String(parsed.id || safe.replace(/\.json$/i, '') || 'imported').replace(/[^\w.-]/g, '-').slice(0, 40) || 'imported'
            const config = writeConfig({
              id,
              name: String(parsed.name || id),
              skillDir: String(parsed.skillDir || ''),
              subsDir: String(parsed.subsDir || ''),
              tabs: Array.isArray(parsed.tabs) && parsed.tabs.length ? parsed.tabs : ALL_TABS,
              note: String(parsed.note || '从文件导入'),
              updatedAt: new Date().toISOString(),
            })
            return send(200, { kind: 'config', id: config.id, name: config.name })
          }
          const dir = join(ROOT, 'imports')
          mkdir(dir, { recursive: true })
          const target = join(dir, safe)
          writeFileSync(target, String(text), 'utf8')
          send(200, { kind: 'reference', name: safe, path: target })
        } catch (error) {
          send(400, { error: String((error && error.message) || error) })
        }
      })
    },
  }), 'humanities-workbench: import')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: CORPUS_PATH,
    resource: async (request) => {
      const q = new URL(request.url).searchParams.get('q') || ''
      const subs = subsDirOf(base)
      const status = corpusStatus(CORPUS_FILE, subs)
      if (!q) return json({ ready: status.exists, stale: status.stale, subsDir: subs || '' })
      const corpus = corpusFor(subs)
      if (!corpus) return json({ ready: false, error: '没有可用语料', hits: [] })
      return json({ ready: true, total: corpus.stats.segments, files: corpus.stats.files, hits: searchCorpus(corpus, q, 8) })
    },
  }), 'humanities-workbench: corpus')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: CONFIGS_PATH,
    resource: async () => json({ configs: listConfigs() }),
  }), 'humanities-workbench: configs')

  ctx.effect(() => ctx.tools.register({
    name: 'hw_corpus',
    description: '在本地字幕语料里检索，返回最相关的片段、BV 号与时间码。用于确认某个概念在语料里到底怎么讲、出处是哪一段。',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '检索词，中文按二元组匹配' },
        limit: { type: 'number', description: '返回条数，默认 5，最多 20' },
        rebuild: { type: 'boolean', description: '字幕目录有新增时强制重建索引' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    output,
    async execute(args) {
      const corpus = corpusFor(subsDir(), Boolean(args.rebuild))
      if (!corpus) return JSON.stringify({ error: '没有可用语料：请先在配置里设置 subsDir，并确认目录存在' })
      const limit = Math.min(Math.max(Number(args.limit) || 5, 1), 20)
      const hits = searchCorpus(corpus, String(args.query), limit)
      return JSON.stringify({ query: args.query, total: corpus.stats.segments, files: corpus.stats.files, hits })
    },
  }), 'humanities-workbench: hw_corpus')

  registerTools(ctx, base)
  note('routes and tools registered')
}
