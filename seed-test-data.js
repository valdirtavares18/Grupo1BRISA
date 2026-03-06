const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Carregar .env.local para obter credenciais do Turso
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
  })
}

const useTurso =
  typeof process.env.TURSO_DATABASE_URL === 'string' &&
  process.env.TURSO_DATABASE_URL.length > 0 &&
  typeof process.env.TURSO_AUTH_TOKEN === 'string' &&
  process.env.TURSO_AUTH_TOKEN.length > 0

let execSql

if (useTurso) {
  const { createClient } = require('@libsql/client')
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  execSql = (sql) => client.execute(sql)
  console.log('🌐 Usando banco TURSO:', process.env.TURSO_DATABASE_URL)
} else {
  const Database = require('better-sqlite3')
  const db = new Database('presenca.db')
  execSql = (sql) => {
    db.exec(sql)
    return Promise.resolve()
  }
  console.log('💾 Usando banco local: presenca.db')
}

console.log('🌱 Inserindo dados de teste...\n')

async function seed() {
  try {
    // 0. Criar/Verificar SUPER_ADMIN
    console.log('🔐 Criando/Verificando SUPER_ADMIN...')
    const superAdminHash = await bcrypt.hash('admin123', 10)
    await execSql(`
      INSERT OR REPLACE INTO "platform_users" (id, email, "passwordHash", role, "isActive", "createdAt") VALUES 
        ('super-admin-1', 'admin@teste.com', '${superAdminHash}', 'SUPER_ADMIN', 1, CURRENT_TIMESTAMP);
    `)
    console.log('✅ SUPER_ADMIN criado/atualizado\n')
    
    // 1. Criar organizações
    console.log('🏢 Criando organizações...')
    const org1Id = 'org-exemplo-1'
    const org2Id = 'org-exemplo-2'
    
    await execSql(`
      INSERT OR IGNORE INTO "Organization" (id, name, slug, "isActive", "createdAt", "updatedAt") VALUES
        ('${org1Id}', 'Tech Conference 2025', 'tech-conf-2025', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR IGNORE INTO "Organization" (id, name, slug, "isActive", "createdAt", "updatedAt") VALUES
        ('${org2Id}', 'Festival de Música', 'festival-musica', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `)

    await execSql(`
      INSERT OR IGNORE INTO "organization_themes" (id, "organizationId", "primaryColor", "backgroundStyle", "createdAt") VALUES
        ('theme-1', '${org1Id}', '#0066FF', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR IGNORE INTO "organization_themes" (id, "organizationId", "primaryColor", "backgroundStyle", "createdAt") VALUES
        ('theme-2', '${org2Id}', '#FF3366', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', CURRENT_TIMESTAMP);
    `)
    console.log('✅ Organizações criadas\n')

    // 2. Criar admins (INSERT OR REPLACE para garantir que a senha seja atualizada)
    console.log('👤 Criando admins...')
    const adminOrg1Hash = await bcrypt.hash('org1admin123', 10)
    const adminOrg2Hash = await bcrypt.hash('org2admin123', 10)
    
    await execSql(`
      INSERT OR REPLACE INTO "platform_users" (id, "organizationId", email, "passwordHash", role, "isActive", "createdAt") VALUES
        ('admin-org-1', '${org1Id}', 'admin@techconf.com', '${adminOrg1Hash}', 'ORG_ADMIN', 1, CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR REPLACE INTO "platform_users" (id, "organizationId", email, "passwordHash", role, "isActive", "createdAt") VALUES
        ('admin-org-2', '${org2Id}', 'admin@festival.com', '${adminOrg2Hash}', 'ORG_ADMIN', 1, CURRENT_TIMESTAMP);
    `)
    console.log('✅ Admins criados\n')

    // 3. Criar usuários finais
    console.log('👥 Criando usuários finais...')
    const user1Hash = await bcrypt.hash('user123', 10)
    const user2Hash = await bcrypt.hash('user123', 10)
    
    await execSql(`
      INSERT OR REPLACE INTO "end_users" (id, cpf, "passwordHash", "fullName", phone, email, "phoneVerified", "zipCode", "createdAt", "updatedAt") VALUES
        ('user-1', '12345678901', '${user1Hash}', 'João Silva', '11987654321', 'joao@teste.com', 1, '01310100', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR REPLACE INTO "end_users" (id, cpf, "passwordHash", "fullName", phone, email, "phoneVerified", "zipCode", "createdAt", "updatedAt") VALUES
        ('user-2', '98765432100', '${user2Hash}', 'Maria Santos', '11976543210', 'maria@teste.com', 1, '20040020', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `)
    console.log('✅ Usuários criados\n')

    // 4. Criar eventos
    console.log('🎉 Criando eventos...')
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const event1Start = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const event1End = tomorrow.toISOString()
    const event2Start = nextWeek.toISOString()
    const event2End = new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000).toISOString()
    const event3Start = yesterday.toISOString()
    const event3End = new Date(yesterday.getTime() + 3 * 60 * 60 * 1000).toISOString()

    await execSql(`
      INSERT OR IGNORE INTO "Event" (id, "organizationId", title, description, "startDate", "endDate", "qrCodeToken", address, city, state, "zipCode", "eventType", "createdAt") VALUES
        ('event-1', '${org1Id}', 'Workshop de React', 'Workshop completo sobre React e Next.js', '${event1Start}', '${event1End}', 'qr-token-workshop-react', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310100', 'Workshop', CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR IGNORE INTO "Event" (id, "organizationId", title, description, "startDate", "endDate", "qrCodeToken", address, city, state, "zipCode", "eventType", "createdAt") VALUES
        ('event-2', '${org1Id}', 'Conferência de IA', 'Conferência sobre IA e Machine Learning', '${event2Start}', '${event2End}', 'qr-token-conf-ia', 'Av. Brigadeiro Faria Lima, 2000', 'São Paulo', 'SP', '01451000', 'Conferência', CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR IGNORE INTO "Event" (id, "organizationId", title, description, "startDate", "endDate", "qrCodeToken", address, city, state, "zipCode", "eventType", "createdAt") VALUES
        ('event-3', '${org2Id}', 'Show de Rock', 'Show com bandas de rock', '${event3Start}', '${event3End}', 'qr-token-show-rock', 'Parque Ibirapuera', 'São Paulo', 'SP', '04094000', 'Show', CURRENT_TIMESTAMP);
    `)
    console.log('✅ Eventos criados\n')

    // 5. Criar presenças
    console.log('✅ Registrando presenças...')
    await execSql(`
      INSERT OR IGNORE INTO "presence_logs" (id, "eventId", "endUserId", "accessTimestamp", "ipAddress", "userAgent", "initialScanToken") VALUES
        ('presence-1', 'event-1', 'user-1', CURRENT_TIMESTAMP, '192.168.1.1', 'Mozilla/5.0', 'token-1');
    `)
    await execSql(`
      INSERT OR IGNORE INTO "presence_logs" (id, "eventId", "endUserId", "accessTimestamp", "ipAddress", "userAgent", "initialScanToken") VALUES
        ('presence-2', 'event-1', 'user-2', CURRENT_TIMESTAMP, '192.168.1.2', 'Mozilla/5.0', 'token-2');
    `)
    console.log('✅ Presenças registradas\n')

    // 6. Criar feed
    console.log('📰 Criando posts no feed...')
    await execSql(`
      INSERT OR IGNORE INTO "organization_feeds" (id, "organizationId", title, content, published, "createdAt", "updatedAt") VALUES
        ('feed-1', '${org1Id}', 'Workshop de React', 'Não perca nosso workshop completo!', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `)
    await execSql(`
      INSERT OR IGNORE INTO "organization_feeds" (id, "organizationId", title, content, published, "createdAt", "updatedAt") VALUES
        ('feed-2', '${org2Id}', 'Festival de Música', 'Line up confirmado!', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `)
    console.log('✅ Feed criado\n')

    console.log('✅ Dados de teste criados!\n')
    console.log('='.repeat(60))
    console.log('🔐 CREDENCIAIS DE TESTE:')
    console.log('='.repeat(60))
    console.log('\n👑 SUPER ADMIN (Acesso Total):')
    console.log('   Email: admin@teste.com')
    console.log('   Senha: admin123\n')
    console.log('👤 ADMIN ORG 1 (Tech Conference 2025):')
    console.log('   Email: admin@techconf.com')
    console.log('   Senha: org1admin123\n')
    console.log('👤 ADMIN ORG 2 (Festival de Música):')
    console.log('   Email: admin@festival.com')
    console.log('   Senha: org2admin123\n')
    console.log('👥 USUÁRIOS FINAIS (Login com CPF):')
    console.log('   CPF: 12345678901 | Senha: user123')
    console.log('   CPF: 98765432100 | Senha: user123\n')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

seed()
