/**
 * Research graph: a node forks only when a premise differs, a question raised
 * by two lines is researched once, and converging lines meet in one node.
 * Nothing is created until a caller asks for it.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const GRAPH_FILE = 'graph.json'

export const DEFAULT_PARAMS = {
  maxDepth: 3,
  maxNodes: 30,
  nodeParallel: 4,
  cardParallel: 4,
  followUp: 2,
  revisions: 2,
  dedupe: true,
}

export function graphPath(dir) {
  return join(dir, GRAPH_FILE)
}

export function emptyGraph(question, params) {
  const now = new Date().toISOString()
  return {
    version: 1,
    question: String(question || '').trim(),
    createdAt: now,
    updatedAt: now,
    params: { ...DEFAULT_PARAMS, ...(params || {}) },
    nodes: [],
    skipped: [],
  }
}

export function loadGraph(dir) {
  try {
    const parsed = JSON.parse(readFileSync(graphPath(dir), 'utf8'))
    if (!parsed || !Array.isArray(parsed.nodes)) return null
    return { skipped: [], ...parsed, params: { ...DEFAULT_PARAMS, ...(parsed.params || {}) } }
  } catch {
    return null
  }
}

export function saveGraph(dir, graph) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  graph.updatedAt = new Date().toISOString()
  writeFileSync(graphPath(dir), JSON.stringify(graph, null, 2) + '\n', 'utf8')
  return graph
}

/** Same question, however it is typed, has the same key. */
export function normalizeQuestion(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[，。？！、；：“”‘’（）《》【】·—…,.?!;:'"()\[\]<>]/g, '')
}

function nextId(graph) {
  return 'N' + String(graph.nodes.length + 1).padStart(2, '0')
}

export function addNode(graph, input) {
  const question = String((input && input.question) || '').trim()
  if (!question) return { ok: false, error: '缺少问题' }
  const parentId = String((input && input.parent) || '').trim()
  const parent = parentId ? graph.nodes.find((node) => node.id === parentId) : null
  if (parentId && !parent) return { ok: false, error: '父节点不存在：' + parentId }
  const root = graph.nodes.find((node) => node.kind === 'root')
  if (!parent && root) return { ok: false, error: '根节点已经是 ' + root.id + '。分叉请传 parent，两条线相遇请用 converge' }
  const premise = String((input && input.premise) || '').trim()
  if (parent && premise.length < 8) {
    return { ok: false, error: '分叉必须写出与父节点不同的前提，至少八个字；写不出来说明这只是同一个问题' }
  }
  const key = normalizeQuestion(question)
  if (graph.params.dedupe) {
    const twin = graph.nodes.find((node) => normalizeQuestion(node.question) === key)
    if (twin) {
      graph.skipped.push({ question, at: new Date().toISOString(), duplicateOf: twin.id })
      return { ok: false, error: '这个问题已经由 ' + twin.id + ' 研究过，跨线重复只研究一次，请引用那个节点', duplicateOf: twin.id }
    }
  }
  const level = parent ? parent.level + 1 : 0
  if (level > graph.params.maxDepth) return { ok: false, error: '超过最大深度 ' + graph.params.maxDepth }
  if (graph.nodes.length + 1 > graph.params.maxNodes) return { ok: false, error: '超过节点上限 ' + graph.params.maxNodes }
  const node = {
    id: nextId(graph),
    parent: parent ? parent.id : '',
    from: [],
    level,
    kind: parent ? 'fork' : 'root',
    question,
    premise,
    state: 'open',
    note: String((input && input.note) || ''),
    createdAt: new Date().toISOString(),
  }
  graph.nodes.push(node)
  return { ok: true, node }
}

export function converge(graph, input) {
  const from = Array.isArray(input && input.from) ? input.from.map(String).filter(Boolean) : []
  if (from.length < 2) return { ok: false, error: '收敛节点至少要有两个来源节点' }
  const absent = from.filter((id) => !graph.nodes.find((node) => node.id === id))
  if (absent.length) return { ok: false, error: '节点不存在：' + absent.join(', ') }
  const question = String((input && input.question) || '').trim()
  if (!question) return { ok: false, error: '缺少收敛后要回答的问题' }
  const sources = from.map((id) => graph.nodes.find((node) => node.id === id))
  const level = Math.max(...sources.map((node) => node.level)) + 1
  if (level > graph.params.maxDepth + 1) return { ok: false, error: '超过最大深度 ' + graph.params.maxDepth }
  if (graph.nodes.length + 1 > graph.params.maxNodes) return { ok: false, error: '超过节点上限 ' + graph.params.maxNodes }
  const node = {
    id: nextId(graph),
    parent: '',
    from,
    level,
    kind: 'convergence',
    question,
    premise: String((input && input.premise) || '两条线在这一点相遇'),
    state: 'open',
    note: String((input && input.note) || ''),
    createdAt: new Date().toISOString(),
  }
  graph.nodes.push(node)
  return { ok: true, node }
}

export function closeNode(graph, id, note) {
  const node = graph.nodes.find((row) => row.id === String(id || ''))
  if (!node) return { ok: false, error: '节点不存在：' + id }
  node.state = 'done'
  if (note) node.result = String(note).slice(0, 2000)
  node.closedAt = new Date().toISOString()
  return { ok: true, node }
}

export function graphStatus(graph) {
  const byLevel = {}
  for (const node of graph.nodes) byLevel[node.level] = (byLevel[node.level] || 0) + 1
  const open = graph.nodes.filter((node) => node.state === 'open')
  const thin = graph.nodes.filter((node) => node.kind === 'fork' && String(node.premise || '').trim().length < 12)
  return {
    question: graph.question,
    params: graph.params,
    nodes: graph.nodes.length,
    byLevel,
    open: open.map((node) => node.id),
    done: graph.nodes.filter((node) => node.state === 'done').length,
    convergence: graph.nodes.filter((node) => node.kind === 'convergence').length,
    skipped: (graph.skipped || []).length,
    thinPremises: thin.map((node) => node.id),
    next: open.slice(0, 5).map((node) => ({ id: node.id, level: node.level, question: node.question })),
  }
}
