/**
 * Adiciona coluna prizeDrawnAt no Turso.
 * Rode: node scripts/migrate-add-prize-drawn-turso.js
 */
const path = require('path')
const fs = require('fs')

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
  console.error('Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN em .env.local')
  process.exit(1)
}

const { createClient } = require('@libsql/client')
const client = createClient({ url, authToken })

async function main() {
  console.log('Adicionando coluna prizeDrawnAt na tabela presence_logs (Turso)...')
  try {
    await client.execute(
      'ALTER TABLE "presence_logs" ADD COLUMN "prizeDrawnAt" TEXT;'
    )
    console.log('Coluna prizeDrawnAt adicionada com sucesso!')
  } catch (e) {
    if (e.message && e.message.includes('duplicate column')) {
      console.log('Coluna prizeDrawnAt ja existe')
    } else {
      console.error('Erro:', e.message)
      process.exit(1)
    }
  }
}

main()
