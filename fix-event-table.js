const Database = require('better-sqlite3')
const db = new Database('presenca.db')

const columns = [
  { name: 'manuallyEnded', type: 'INTEGER DEFAULT 0' },
  { name: 'address', type: 'TEXT' },
  { name: 'city', type: 'TEXT' },
  { name: 'state', type: 'TEXT' },
  { name: 'zipCode', type: 'TEXT' },
  { name: 'latitude', type: 'REAL' },
  { name: 'longitude', type: 'REAL' },
  { name: 'eventType', type: 'TEXT' },
  { name: 'reward', type: 'TEXT' }
]

columns.forEach(col => {
  try {
    db.exec(`ALTER TABLE "Event" ADD COLUMN "${col.name}" ${col.type};`)
    console.log(`✅ Coluna ${col.name} adicionada`)
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log(`⚠️  Coluna ${col.name} já existe`)
    } else {
      console.log(`❌ Erro em ${col.name}:`, e.message)
    }
  }
})

db.close()
console.log('\n✅ Concluído!')
