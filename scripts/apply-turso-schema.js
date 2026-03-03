/**
 * Aplica o schema (create_schema.sql + event_types) no banco Turso.
 * Usa variáveis de ambiente: TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.
 * Rode: node scripts/apply-turso-schema.js
 * (Ou com .env.local: node --env-file=.env.local scripts/apply-turso-schema.js)
 */
const path = require('path')
const fs = require('fs')

// Carregar .env.local se existir
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
        process.env[key] = val
      }
    }
  })
}

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url || !authToken) {
  console.error('Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN (ex.: em .env.local)')
  process.exit(1)
}

const { createClient } = require('@libsql/client')
const client = createClient({ url, authToken })

function runStatements(sqlContent) {
  const statements = sqlContent
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))
    .filter((s) => !s.toUpperCase().startsWith('ALTER TABLE') || !s.includes('ADD CONSTRAINT'))
  let p = Promise.resolve()
  for (const sql of statements) {
    const s = sql.endsWith(';') ? sql : sql + ';'
    p = p.then(() => client.execute(s))
  }
  return p
}

async function main() {
  console.log('Aplicando schema no Turso...')
  const schemaPath = path.join(__dirname, '..', 'create_schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  await runStatements(schema)
  console.log('create_schema.sql aplicado.')

  // event_types + dados iniciais
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "event_types" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  const defaultTypes = ['Cultura', 'Esporte', 'Educação', 'Maturidade Ativa', 'Recreação']
  for (const name of defaultTypes) {
    const id = require('crypto').randomUUID()
    await client.execute({
      sql: 'INSERT OR IGNORE INTO "event_types" (id, name) VALUES (?, ?)',
      args: [id, name]
    })
  }
  console.log('Tabela event_types criada e tipos padrão inseridos.')

  console.log('Pronto. Banco Turso pronto para uso.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
