const Database = require('better-sqlite3')
const db = new Database('presenca.db')

console.log('Adicionando colunas de endereço na tabela end_users...')

try {
    const columnsToAdd = [
        { name: 'address', type: 'TEXT' },
        { name: 'city', type: 'TEXT' },
        { name: 'state', type: 'TEXT' }
    ]

    const tableInfo = db.prepare("PRAGMA table_info(end_users)").all()

    for (const col of columnsToAdd) {
        const hasColumn = tableInfo.some(c => c.name === col.name)
        if (!hasColumn) {
            db.exec(`ALTER TABLE "end_users" ADD COLUMN "${col.name}" ${col.type};`)
            console.log(`✅ Coluna ${col.name} adicionada com sucesso!`)
        } else {
            console.log(`ℹ️ Coluna ${col.name} já existe`)
        }
    }

} catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error)
} finally {
    db.close()
}
