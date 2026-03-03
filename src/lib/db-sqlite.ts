import path from 'path'

const useTurso =
  typeof process.env.TURSO_DATABASE_URL === 'string' &&
  process.env.TURSO_DATABASE_URL.length > 0 &&
  typeof process.env.TURSO_AUTH_TOKEN === 'string' &&
  process.env.TURSO_AUTH_TOKEN.length > 0

function normalizeQuery(text: string, params?: any[]): { sql: string; params: any[] } {
  let sql = text
  const list: any[] = []
  if (params && params.length > 0) {
    params.forEach((param, index) => {
      sql = sql.replace(`$${index + 1}`, '?')
      list.push(param)
    })
  }
  return { sql, params: list }
}

// Turso (produção) – cliente lazy para não carregar em dev sem env
let _tursoClient: import('@libsql/client').Client | null = null
function getTursoClient(): import('@libsql/client').Client {
  if (_tursoClient) return _tursoClient
  const { createClient } = require('@libsql/client')
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  })
  _tursoClient = client
  return client
}

async function queryTurso(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const { sql, params: args } = normalizeQuery(text, params)
  const client = getTursoClient()
  const result = await client.execute({ sql, args: args.length ? args : [] })
  const columns = result.columns
  const rows = (result.rows as any[]).map((row) => {
    const obj: Record<string, any> = {}
    columns.forEach((col, i) => {
      obj[col] = (row as any[])[i]
    })
    return obj
  })
  const rowCount = typeof (result as any).rowsAffected === 'number' ? (result as any).rowsAffected : result.rows.length
  return { rows, rowCount }
}

// SQLite local – better-sqlite3 só carregado quando não usa Turso (cache único)
let _sqliteDb: import('better-sqlite3').Database | null = null
function getSqliteDb(): import('better-sqlite3').Database {
  if (_sqliteDb) return _sqliteDb
  const Database = require('better-sqlite3') as typeof import('better-sqlite3')
  const dbPath = path.join(process.cwd(), 'presenca.db')
  try {
    _sqliteDb = new Database(dbPath)
    _sqliteDb.pragma('journal_mode = WAL')
    return _sqliteDb
  } catch (e) {
    console.error('[db-sqlite] Erro ao abrir presenca.db:', e)
    throw e
  }
}

function querySqlite(text: string, params?: any[]): { rows: any[]; rowCount: number } {
  const db = getSqliteDb()
  const { sql, params: modifiedParams } = normalizeQuery(text, params)
  const stmt = db.prepare(sql)
  let result: any
  if (text.toLowerCase().trim().startsWith('select')) {
    result = stmt.all(...modifiedParams)
  } else {
    result = stmt.run(...modifiedParams)
  }
  return {
    rows: Array.isArray(result) ? result : [],
    rowCount: typeof result === 'object' && result !== null && 'changes' in result ? result.changes : (Array.isArray(result) ? result.length : 0)
  }
}

export const query = async (text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> => {
  if (useTurso) {
    return queryTurso(text, params)
  }
  return Promise.resolve(querySqlite(text, params))
}

/** Só disponível quando não está usando Turso (SQLite local). Em produção com Turso, não use. */
export function getDb(): import('better-sqlite3').Database {
  if (useTurso) {
    throw new Error('getDb() não está disponível com Turso. Use query() em produção.')
  }
  return getSqliteDb()
}

export default { getDb, query }
