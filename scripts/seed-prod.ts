/**
 * Seed para popular o banco (Turso em prod ou SQLite local) com dados de teste.
 * Cria: 1 SUPER_ADMIN, 1 organização, 1 ORG_ADMIN.
 *
 * Uso: npm run db:seed-prod
 * (Use .env.local com TURSO_* para semear o Turso em produção.)
 */
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

// Carregar .env.local
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

async function seed() {
  const { query } = await import('../src/lib/db-sqlite')
  const { hashPassword } = await import('../src/lib/auth')
  const now = new Date().toISOString()
  console.log('🌱 Seed de produção (super admin + org + org admin)...\n')

  // 1. SUPER_ADMIN (organizationId = null)
  const superAdminId = randomUUID()
  const superAdminHash = await hashPassword('admin123')
  await query(
    `INSERT OR IGNORE INTO platform_users (id, email, "passwordHash", role, "isActive", "createdAt") VALUES (?, ?, ?, ?, ?, ?)`,
    [superAdminId, 'admin@fluxopresente.com', superAdminHash, 'SUPER_ADMIN', 1, now]
  )
  // Se já existir email, INSERT OR IGNORE não insere; então tentar UPDATE para garantir senha
  const checkSuper = await query('SELECT id FROM platform_users WHERE email = ?', ['admin@fluxopresente.com'])
  if (checkSuper.rows.length > 0) {
    await query(
      'UPDATE platform_users SET "passwordHash" = ? WHERE email = ?',
      [superAdminHash, 'admin@fluxopresente.com']
    )
  }
  console.log('✅ SUPER_ADMIN: admin@fluxopresente.com / admin123')

  // 2. Organização
  const orgId = randomUUID()
  await query(
    `INSERT OR IGNORE INTO "Organization" (id, name, slug, "isActive", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)`,
    [orgId, 'Organização Demo', 'demo', 1, now, now]
  )
  const orgRow = await query('SELECT id FROM "Organization" WHERE slug = ?', ['demo'])
  const finalOrgId = orgRow.rows[0]?.id ?? orgId

  await query(
    `INSERT OR IGNORE INTO organization_themes (id, "organizationId", "primaryColor", "createdAt") VALUES (?, ?, ?, ?)`,
    [randomUUID(), finalOrgId, '#001F3F', now]
  )
  console.log('✅ Organização: "Organização Demo" (slug: demo)')

  // 3. ORG_ADMIN
  const orgAdminId = randomUUID()
  const orgAdminHash = await hashPassword('orgadmin123')
  await query(
    `INSERT OR IGNORE INTO platform_users (id, "organizationId", email, "passwordHash", role, "isActive", "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orgAdminId, finalOrgId, 'admin@demo.com', orgAdminHash, 'ORG_ADMIN', 1, now]
  )
  const checkOrgAdmin = await query('SELECT id FROM platform_users WHERE email = ?', ['admin@demo.com'])
  if (checkOrgAdmin.rows.length > 0) {
    await query(
      'UPDATE platform_users SET "passwordHash" = ?, "organizationId" = ? WHERE email = ?',
      [orgAdminHash, finalOrgId, 'admin@demo.com']
    )
  }
  console.log('✅ ORG_ADMIN: admin@demo.com / orgadmin123 (organização Demo)\n')

  console.log('--- Credenciais de teste ---')
  console.log('Super Admin:  admin@fluxopresente.com  /  admin123')
  console.log('Admin Org:    admin@demo.com          /  orgadmin123')
  console.log('----------------------------')
  console.log('Pronto. Faça login em /login (toggle "Profissional") com um dos emails acima.')
}

void seed().catch((e) => {
  console.error('Erro no seed:', e)
  process.exit(1)
})
