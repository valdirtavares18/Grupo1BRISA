const Database = require('better-sqlite3')
const db = new Database('presenca.db')

console.log('Criando tabelas no SQLite...')

db.exec(`
CREATE TABLE IF NOT EXISTS "Organization" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  "isActive" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "organization_themes" (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT UNIQUE NOT NULL,
  "primaryColor" TEXT DEFAULT '#001F3F',
  "logoUrl" TEXT,
  "backgroundStyle" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "platform_users" (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  role TEXT NOT NULL,
  "isActive" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "end_users" (
  id TEXT PRIMARY KEY,
  cpf TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "fullName" TEXT,
  phone TEXT,
  email TEXT,
  "profilePhotoUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Event" (
  id TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "qrCodeToken" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "presence_logs" (
  id TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "endUserId" TEXT,
  "accessTimestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "initialScanToken" TEXT,
  FOREIGN KEY ("eventId") REFERENCES "Event"(id) ON DELETE CASCADE,
  FOREIGN KEY ("endUserId") REFERENCES "end_users"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "user_consents" (
  id TEXT PRIMARY KEY,
  "endUserId" TEXT NOT NULL,
  "dataType" TEXT NOT NULL,
  "isGiven" INTEGER NOT NULL,
  "consentTimestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("endUserId") REFERENCES "end_users"(id) ON DELETE CASCADE,
  UNIQUE("endUserId", "dataType")
);
`)

console.log('Inserindo usuário admin...')

db.exec(`
INSERT OR IGNORE INTO "platform_users" (id, email, "passwordHash", role, "isActive") VALUES 
  ('1', 'admin@teste.com', '$2a$10$/.5LINBLFkIpkVmtCevl5.AlhgDNOuppCYLCszfvMF7hmAEKQBWFS', 'SUPER_ADMIN', 1);
`)

console.log('✅ Banco SQLite criado com todas as tabelas!')
console.log('Login: admin@teste.com / admin123')

db.close()
