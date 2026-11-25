/**
 * Two switches, stored on this machine only: whether the methodology digest
 * reaches the model, and whether a corpus keyword hit adds a retrieval hint.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'

export const STATE_FILE = join(homedir(), '.dsh', 'humanities-workbench', 'state.json')
export const DEFAULT_STATE = Object.freeze({ method: true, corpus: true, config: '', updatedAt: '' })

const file = () => process.env.HW_STATE_FILE || STATE_FILE

/** Read the switches; a missing or broken file means both are on. */
export function readState() {
  try {
    const parsed = JSON.parse(readFileSync(file(), 'utf8'))
    return {
      method: typeof parsed.method === 'boolean' ? parsed.method : true,
      corpus: typeof parsed.corpus === 'boolean' ? parsed.corpus : true,
      config: typeof parsed.config === 'string' && /^[\w.-]{1,40}$/.test(parsed.config) ? parsed.config : '',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

/** Merge a patch into the stored switches and report the result. */
export function writeState(patch) {
  const next = readState()
  if (patch && typeof patch === 'object') {
    if (typeof patch.method === 'boolean') next.method = patch.method
    if (typeof patch.corpus === 'boolean') next.corpus = patch.corpus
    if (typeof patch.config === 'string' && /^[\w.-]{1,40}$/.test(patch.config)) next.config = patch.config
  }
  next.updatedAt = new Date().toISOString()
  try {
    mkdirSync(dirname(file()), { recursive: true })
    writeFileSync(file(), JSON.stringify(next, null, 2) + '\n', 'utf8')
  } catch {
    // A read-only home should not break a panel toggle.
  }
  return next
}

export function statePath() {
  return file()
}
