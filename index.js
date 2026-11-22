/**
 * Host half: panel data routes plus the reader tools.
 */
import { mkdirSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { buildData } from './data.mjs'
import { listConfigs, resolveConfig, configStatus } from './configs.mjs'
import { readPage, readPages, wikiExtract, bilibiliTranscript } from './tools.mjs'

export const DATA_PATH = '/humanities-workbench/data.json'
export const CONFIGS_PATH = '/humanities-workbench/configs.json'
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
    const key = (id || '') + '|' + (base.skillDir || '')
    const now = Date.now()
    if (cache && cache.key === key && now - cache.at < CACHE_MS) return cache.body
    const chosen = resolveConfig(id)
    const skillDir = base.skillDir || (chosen && chosen.skillDir)
    const subsDir = base.subsDir || (chosen && chosen.subsDir)
    const body = {
      ...buildData({ skillDir, subsDir }),
      config: chosen ? { id: chosen.id, name: chosen.name, tabs: chosen.tabs, note: chosen.note } : null,
      status: configStatus({ skillDir }),
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
    path: CONFIGS_PATH,
    resource: async () => json({ configs: listConfigs() }),
  }), 'humanities-workbench: configs')

  registerTools(ctx, base)
  note('routes and tools registered')
}
