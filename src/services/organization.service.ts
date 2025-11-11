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
