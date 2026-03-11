const Database = require('better-sqlite3')
const db = new Database('presenca.db')

console.log('Adicionando coluna prizeDrawnAt na tabela presence_logs...')

try {
  const tableInfo = db.prepare("PRAGMA table_info(presence_logs)").all()
  const hasPrizeDrawnAt = tableInfo.some(col => col.name === 'prizeDrawnAt')

  if (!hasPrizeDrawnAt) {
    db.exec('ALTER TABLE "presence_logs" ADD COLUMN "prizeDrawnAt" TIMESTAMP;')
    console.log('Coluna prizeDrawnAt adicionada com sucesso!')
  } else {
    console.log('Coluna prizeDrawnAt ja existe')
  }
} catch (error) {
  console.error('Erro ao adicionar coluna:', error)
} finally {
  db.close()
}
