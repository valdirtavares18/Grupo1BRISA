import { query } from '@/lib/db-sqlite'

export class EndUserService {
  /**
   * Busca todos os usuários finais únicos que participaram de eventos de uma organização
   */
  async getEndUsersByOrganization(organizationId: string) {
    // Buscar todos os eventos da organização
    const events = await query(
      'SELECT id FROM "Event" WHERE "organizationId" = ?',
      [organizationId]
    )

    if (events.rows.length === 0) {
      return []
    }

    const eventIds = events.rows.map((e: any) => e.id)

    // Buscar usuários únicos que participaram desses eventos
    const placeholders = eventIds.map(() => '?').join(',')
    const result = await query(
      `SELECT 
        eu.id,
        eu.cpf,
        eu."fullName",
        eu.phone,
        eu.email,
        eu."profilePhotoUrl",
        eu."createdAt",
        eu."updatedAt",
        COUNT(pl.id) as totalPresences,
        MIN(pl."accessTimestamp") as firstPresence,
        MAX(pl."accessTimestamp") as lastPresence
      FROM "end_users" eu
      INNER JOIN "presence_logs" pl ON eu.id = pl."endUserId"
      WHERE pl."eventId" IN (${placeholders})
      GROUP BY eu.id, eu.cpf, eu."fullName", eu.phone, eu.email, eu."profilePhotoUrl", eu."createdAt", eu."updatedAt"
      ORDER BY lastPresence DESC`,
      eventIds
    )

    return result.rows.map((row: any) => ({
      id: row.id,
      cpf: row.cpf,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
      profilePhotoUrl: row.profilePhotoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      totalPresences: row.totalPresences || 0,
      firstPresence: row.firstPresence,
      lastPresence: row.lastPresence,
    }))
  }

  /**
   * Busca estatísticas de usuários finais de uma organização
   */
  async getEndUserStatsByOrganization(organizationId: string) {
    const events = await query(
      'SELECT id FROM "Event" WHERE "organizationId" = ?',
      [organizationId]
    )

    if (events.rows.length === 0) {
      return {
        total: 0,
        withName: 0,
        withEmail: 0,
        withPhone: 0,
      }
    }

    const eventIds = events.rows.map((e: any) => e.id)
    const placeholders = eventIds.map(() => '?').join(',')

    // Total de usuários únicos
    const totalResult = await query(
      `SELECT COUNT(DISTINCT eu.id) as count
      FROM "end_users" eu
      INNER JOIN "presence_logs" pl ON eu.id = pl."endUserId"
      WHERE pl."eventId" IN (${placeholders})`,
      eventIds
    )

    // Usuários com nome
    const withNameResult = await query(
      `SELECT COUNT(DISTINCT eu.id) as count
      FROM "end_users" eu
      INNER JOIN "presence_logs" pl ON eu.id = pl."endUserId"
      WHERE pl."eventId" IN (${placeholders}) AND eu."fullName" IS NOT NULL AND eu."fullName" != ''`,
      eventIds
    )

    // Usuários com email
    const withEmailResult = await query(
      `SELECT COUNT(DISTINCT eu.id) as count
      FROM "end_users" eu
      INNER JOIN "presence_logs" pl ON eu.id = pl."endUserId"
      WHERE pl."eventId" IN (${placeholders}) AND eu.email IS NOT NULL AND eu.email != ''`,
      eventIds
    )

    // Usuários com telefone
    const withPhoneResult = await query(
      `SELECT COUNT(DISTINCT eu.id) as count
      FROM "end_users" eu
      INNER JOIN "presence_logs" pl ON eu.id = pl."endUserId"
      WHERE pl."eventId" IN (${placeholders}) AND eu.phone IS NOT NULL AND eu.phone != ''`,
      eventIds
    )

    return {
      total: totalResult.rows[0]?.count || 0,
      withName: withNameResult.rows[0]?.count || 0,
      withEmail: withEmailResult.rows[0]?.count || 0,
      withPhone: withPhoneResult.rows[0]?.count || 0,
    }
  }

  /**
   * Busca um usuário final por ID
   */
  async getEndUserById(id: string) {
    const result = await query(
      'SELECT * FROM "end_users" WHERE id = ?',
      [id]
    )

    if (result.rows.length === 0) return null

    return result.rows[0]
  }
}

export const endUserService = new EndUserService()

