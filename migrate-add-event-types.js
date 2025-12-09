const Database = require('better-sqlite3')
const db = new Database('presenca.db')

console.log('Criando tabela event_types...')

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS "event_types" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Inserir tipos padrão se não existirem
  const defaultTypes = ['Cultura', 'Esporte', 'Educação', 'Maturidade Ativa', 'Recreação']
  
  defaultTypes.forEach(type => {
    try {
      const id = require('crypto').randomUUID()
      db.prepare('INSERT OR IGNORE INTO "event_types" (id, name) VALUES (?, ?)').run(id, type)
    } catch (err) {
      // Ignorar se já existe
    }
  })

  console.log('✅ Tabela event_types criada com sucesso!')
} catch (error) {
  console.error('❌ Erro ao criar tabela:', error)
} finally {
  db.close()
}


