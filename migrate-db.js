const Database = require('better-sqlite3')
const db = new Database('presenca.db')

console.log('��� Atualizando banco de dados...\n')

try {
  // Adicionar colunas na tabela Event
  db.exec(`
    ALTER TABLE "Event" ADD COLUMN "manuallyEnded" INTEGER DEFAULT 0;
    ALTER TABLE "Event" ADD COLUMN address TEXT;
    ALTER TABLE "Event" ADD COLUMN city TEXT;
    ALTER TABLE "Event" ADD COLUMN state TEXT;
    ALTER TABLE "Event" ADD COLUMN "zipCode" TEXT;
    ALTER TABLE "Event" ADD COLUMN latitude REAL;
    ALTER TABLE "Event" ADD COLUMN longitude REAL;
    ALTER TABLE "Event" ADD COLUMN "eventType" TEXT;
    ALTER TABLE "Event" ADD COLUMN reward TEXT;
  `)
  console.log('✅ Tabela Event atualizada')
} catch (e) {
  if (!e.message.includes('duplicate column')) {
    console.log('⚠️  Event:', e.message)
  }
}

try {
  // Adicionar colunas na tabela end_users
  db.exec(`
    ALTER TABLE "end_users" ADD COLUMN "zipCode" TEXT;
    ALTER TABLE "end_users" ADD COLUMN biography TEXT;
    ALTER TABLE "end_users" ADD COLUMN "phoneVerified" INTEGER DEFAULT 0;
    ALTER TABLE "end_users" ADD COLUMN "phoneVerificationCode" TEXT;
    ALTER TABLE "end_users" ADD COLUMN "phoneVerificationExpires" TIMESTAMP;
  `)
  console.log('✅ Tabela end_users atualizada')
} catch (e) {
  if (!e.message.includes('duplicate column')) {
    console.log('⚠️  end_users:', e.message)
  }
}

try {
  // Criar tabela organization_feeds
  db.exec(`
    CREATE TABLE IF NOT EXISTS "organization_feeds" (
      id TEXT PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      "imageUrl" TEXT,
      published INTEGER DEFAULT 1,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON DELETE CASCADE
    );
  `)
  console.log('✅ Tabela organization_feeds criada')
} catch (e) {
  console.log('⚠️  organization_feeds:', e.message)
}

try {
  // Criar tabela phone_verifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS "phone_verifications" (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  console.log('✅ Tabela phone_verifications criada')
} catch (e) {
  console.log('⚠️  phone_verifications:', e.message)
}

// Criar índices
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS "Event_city_idx" ON "Event"("city");
    CREATE INDEX IF NOT EXISTS "Event_state_idx" ON "Event"("state");
    CREATE INDEX IF NOT EXISTS "Event_eventType_idx" ON "Event"("eventType");
    CREATE INDEX IF NOT EXISTS "organization_feeds_organizationId_idx" ON "organization_feeds"("organizationId");
    CREATE INDEX IF NOT EXISTS "organization_feeds_published_idx" ON "organization_feeds"("published");
    CREATE INDEX IF NOT EXISTS "phone_verifications_phone_idx" ON "phone_verifications"("phone");
  `)
  console.log('✅ Índices criados')
} catch (e) {
  console.log('⚠️  Índices:', e.message)
}

db.close()
console.log('\n✅ Migração concluída!')
