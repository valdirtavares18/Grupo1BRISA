import { query } from '@/lib/db-sqlite'

export class OrganizationService {
  async createOrganization(data: {
    name: string
    slug: string
    theme?: {
      primaryColor?: string
      logoUrl?: string
      backgroundStyle?: string
    }
  }) {
    // Validar campos obrigatórios
    if (!data.name || data.name.trim() === '') {
      throw new Error('O nome da organização é obrigatório')
    }

    if (!data.slug || data.slug.trim() === '') {
      throw new Error('O slug da organização é obrigatório')
    }

    // Validar formato do slug
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(data.slug)) {
      throw new Error('O slug deve conter apenas letras minúsculas, números e hífens')
    }

    // Validar slugs reservados
    const reservedSlugs = ['admin', 'login', 'register', 'api', 'dashboard', 'event', 'platform']
    if (reservedSlugs.includes(data.slug)) {
      throw new Error('Este slug está reservado pelo sistema')
    }

    const existing = await query(
      'SELECT * FROM "Organization" WHERE slug = ?',
      [data.slug]
    )

    if (existing.rows.length > 0) {
      throw new Error('Já existe uma organização com este slug')
    }

    const id = require('crypto').randomUUID()
    
    await query(
      'INSERT INTO "Organization" (id, name, slug) VALUES (?, ?, ?)',
      [id, data.name, data.slug]
    )

    if (data.theme) {
      await query(
        'INSERT INTO "organization_themes" (id, "organizationId", "primaryColor", "logoUrl", "backgroundStyle") VALUES (?, ?, ?, ?, ?)',
        [require('crypto').randomUUID(), id, data.theme.primaryColor || '#001F3F', data.theme.logoUrl || null, data.theme.backgroundStyle || null]
      )
    }

    return this.getOrganizationBySlug(data.slug)
  }

  async getOrganizationById(id: string) {
    const result = await query(
      'SELECT * FROM "Organization" WHERE id = ?',
      [id]
    )

    if (result.rows.length === 0) return null

    const org = result.rows[0]
    
    const theme = await query(
      'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
      [org.id]
    )

    const eventCount = await query(
      'SELECT COUNT(*) as count FROM "Event" WHERE "organizationId" = ?',
      [org.id]
    )

    const userCount = await query(
      'SELECT COUNT(*) as count FROM platform_users WHERE "organizationId" = ?',
      [org.id]
    )

    return {
      ...org,
      theme: theme.rows[0] || null,
      _count: {
        events: eventCount.rows[0].count || 0,
        platformUsers: userCount.rows[0].count || 0
      }
    }
  }

  async getOrganizationBySlug(slug: string) {
    const result = await query(
      'SELECT * FROM "Organization" WHERE slug = ?',
      [slug]
    )

    if (result.rows.length === 0) return null

    const org = result.rows[0]
    
    const theme = await query(
      'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
      [org.id]
    )

    const counts = await query(
      'SELECT COUNT(*) as count FROM "Event" WHERE "organizationId" = ?',
      [org.id]
    )

    return {
      ...org,
      theme: theme.rows[0] || null,
      _count: {
        events: counts.rows[0].count || 0,
        platformUsers: 0
      }
    }
  }

  async getAllOrganizations() {
    const result = await query('SELECT * FROM "Organization" ORDER BY "createdAt" DESC')
    
    const organizations = await Promise.all(
      result.rows.map(async (org) => {
        const theme = await query(
          'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
          [org.id]
        )

        const eventCount = await query(
          'SELECT COUNT(*) as count FROM "Event" WHERE "organizationId" = ?',
          [org.id]
        )

        return {
          ...org,
          theme: theme.rows[0] || null,
          _count: {
            events: eventCount.rows[0].count || 0,
            platformUsers: 0
          }
        }
      })
    )

    return organizations
  }

  async updateOrganization(organizationId: string, data: {
    name?: string
    slug?: string
    isActive?: boolean
    theme?: {
      primaryColor?: string
      logoUrl?: string
      backgroundStyle?: string
    }
  }) {
    const updates = []
    const values = []

    if (data.name) {
      updates.push('name = ?')
      values.push(data.name)
    }

    if (data.slug) {
      // Validar formato do slug
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(data.slug)) {
        throw new Error('O slug deve conter apenas letras minúsculas, números e hífens')
      }

      // Verificar se o slug já existe (exceto para a própria organização)
      const existing = await query(
        'SELECT * FROM "Organization" WHERE slug = ? AND id != ?',
        [data.slug, organizationId]
      )

      if (existing.rows.length > 0) {
        throw new Error('Já existe uma organização com este slug')
      }

      updates.push('slug = ?')
      values.push(data.slug)
    }

    if (data.isActive !== undefined) {
      updates.push('"isActive" = ?')
      values.push(data.isActive ? 1 : 0)
    }

    if (updates.length > 0) {
      values.push(organizationId)
      await query(
        `UPDATE "Organization" SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }

    // Atualizar tema se fornecido
    if (data.theme) {
      await this.updateTheme(organizationId, data.theme)
    }

    return this.getOrganizationById(organizationId)
  }

  async deleteOrganization(organizationId: string) {
    // Deletar tema
    await query(
      'DELETE FROM "organization_themes" WHERE "organizationId" = ?',
      [organizationId]
    )

    // Deletar eventos e presenças vinculadas
    const events = await query(
      'SELECT id FROM "Event" WHERE "organizationId" = ?',
      [organizationId]
    )

    for (const event of events.rows) {
      await query(
        'DELETE FROM presence_logs WHERE "eventId" = ?',
        [event.id]
      )
    }

    await query(
      'DELETE FROM "Event" WHERE "organizationId" = ?',
      [organizationId]
    )

    // Deletar usuários da organização
    await query(
      'DELETE FROM platform_users WHERE "organizationId" = ?',
      [organizationId]
    )

    // Deletar a organização
    await query(
      'DELETE FROM "Organization" WHERE id = ?',
      [organizationId]
    )

    return { success: true }
  }

  async updateTheme(
    organizationId: string,
    theme: {
      primaryColor?: string
      logoUrl?: string
      backgroundStyle?: string
    }
  ) {
    const existing = await query(
      'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
      [organizationId]
    )

    if (existing.rows.length > 0) {
      await query(
        'UPDATE "organization_themes" SET "primaryColor" = ?, "logoUrl" = ?, "backgroundStyle" = ? WHERE "organizationId" = ?',
        [theme.primaryColor || '#001F3F', theme.logoUrl || null, theme.backgroundStyle || null, organizationId]
      )
      return existing.rows[0]
    } else {
      await query(
        'INSERT INTO "organization_themes" (id, "organizationId", "primaryColor", "logoUrl", "backgroundStyle") VALUES (?, ?, ?, ?, ?)',
        [require('crypto').randomUUID(), organizationId, theme.primaryColor || '#001F3F', theme.logoUrl || null, theme.backgroundStyle || null]
      )
      const result = await query(
        'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
        [organizationId]
      )
      return result.rows[0]
    }
  }
}

export const organizationService = new OrganizationService()
