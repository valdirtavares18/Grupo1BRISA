import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'presenca.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db
  try {
    _db = new Database(dbPath)
    _db.pragma('journal_mode = WAL')
    return _db
  } catch (e) {
    console.error('[db-sqlite] Erro ao abrir presenca.db:', e)
    throw e
  }
}

export const query = async (text: string, params?: any[]) => {
  const db = getDb()
  let modifiedQuery = text
  const modifiedParams: any[] = []

  if (params && params.length > 0) {
    params.forEach((param, index) => {
      modifiedQuery = modifiedQuery.replace(`$${index + 1}`, '?')
      modifiedParams.push(param)
    })
  }

  const stmt = db.prepare(modifiedQuery)
  let result

  if (text.toLowerCase().trim().startsWith('select')) {
    result = stmt.all(...modifiedParams)
  } else {
    result = stmt.run(...modifiedParams)
  }

  return {
    rows: Array.isArray(result) ? result : [],
    rowCount: 'changes' in result ? result.changes : result.length
  }
}

export default { getDb, query }
