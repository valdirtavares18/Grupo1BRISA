const Database = require('better-sqlite3')
const db = new Database('presenca.db')

console.log('Adicionando coluna profile na tabela presence_logs...')

try {
  // Verificar se a coluna já existe
  const tableInfo = db.prepare("PRAGMA table_info(presence_logs)").all()
  const hasProfile = tableInfo.some(col => col.name === 'profile')

  if (!hasProfile) {
    db.exec('ALTER TABLE "presence_logs" ADD COLUMN "profile" TEXT;')
    console.log('✅ Coluna profile adicionada com sucesso!')
  } else {
    console.log('ℹ️ Coluna profile já existe')
  }
} catch (error) {
  console.error('❌ Erro ao adicionar coluna:', error)
} finally {
  db.close()
}


