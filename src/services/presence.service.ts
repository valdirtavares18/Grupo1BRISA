import { query } from '@/lib/db-sqlite'
import { randomUUID } from 'crypto'

export class PresenceService {
  async logPresence(data: {
    eventId: string
    endUserId?: string
    ipAddress?: string
    userAgent?: string
    initialScanToken: string
    profile?: string
  }) {
    // Buscar informações do evento
    const eventResult = await query(
      'SELECT * FROM "Event" WHERE id = ?',
      [data.eventId]
    )

    if (eventResult.rows.length === 0) {
      throw new Error('Evento não encontrado')
    }

    const event = eventResult.rows[0]
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    // Verificar se foi encerrado manualmente
    if (event.manuallyEnded === 1) {
      throw new Error('Este evento foi encerrado. O registro de presença não está mais disponível.')
    }

    // Validar se o evento está dentro do horário programado
    if (now < startDate) {
      throw new Error('Este evento ainda não começou. Aguarde o horário de início.')
    }

    if (now > endDate) {
      throw new Error('Este evento já foi encerrado. O registro de presença não está mais disponível.')
    }

    // Verificar presença duplicada se tiver endUserId
    if (data.endUserId) {
      const existingPresence = await query(
        'SELECT * FROM "presence_logs" WHERE "eventId" = ? AND "endUserId" = ?',
        [data.eventId, data.endUserId]
      )

      if (existingPresence.rows.length > 0) {
        throw new Error('Você já registrou presença neste evento')
      }
    }

    const id = randomUUID()

    await query(
      'INSERT INTO "presence_logs" (id, "eventId", "endUserId", "ipAddress", "userAgent", "initialScanToken", "profile") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.eventId, data.endUserId || null, data.ipAddress || null, data.userAgent || null, data.initialScanToken, data.profile || null]
    )

    const result = await query(
      'SELECT * FROM "presence_logs" WHERE id = ?',
      [id]
    )

    return result.rows[0]
  }

  async updatePresenceWithUser(logId: string, endUserId: string, profile?: string) {
    if (profile) {
      await query(
        'UPDATE "presence_logs" SET "endUserId" = ?, "profile" = ? WHERE id = ?',
        [endUserId, profile, logId]
      )
    } else {
      await query(
        'UPDATE "presence_logs" SET "endUserId" = ? WHERE id = ?',
        [endUserId, logId]
      )
    }

    const result = await query(
      'SELECT * FROM "presence_logs" WHERE id = ?',
      [logId]
    )

    return result.rows[0]
  }

  async getPresenceLogsByEvent(eventId: string) {
    const result = await query(
      'SELECT * FROM "presence_logs" WHERE "eventId" = ? ORDER BY "accessTimestamp" DESC',
      [eventId]
    )

    const logs = await Promise.all(
      result.rows.map(async (log) => {
        if (log.endUserId) {
          const user = await query(
            'SELECT * FROM "end_users" WHERE id = ?',
            [log.endUserId]
          )
          return {
            ...log,
            endUser: user.rows[0] || null
          }
        }
        return {
          ...log,
          endUser: null
        }
      })
    )

    return logs
  }

  async getPresenceStatsByEvent(eventId: string) {
    const [total, withUser, anonymous] = await Promise.all([
      query('SELECT COUNT(*) as count FROM presence_logs WHERE "eventId" = ?', [eventId]),
      query('SELECT COUNT(*) as count FROM presence_logs WHERE "eventId" = ? AND "endUserId" IS NOT NULL', [eventId]),
      query('SELECT COUNT(*) as count FROM presence_logs WHERE "eventId" = ? AND "endUserId" IS NULL', [eventId]),
    ])

    const totalCount = Number(total.rows[0]?.count ?? 0)
    const identifiedCount = Number(withUser.rows[0]?.count ?? 0)
    const anonymousCount = Number(anonymous.rows[0]?.count ?? 0)

    return {
      total: totalCount,
      identified: identifiedCount,
      anonymous: anonymousCount
    }
  }

  async getRecentPresences(limit = 10) {
    const result = await query(
      'SELECT * FROM "presence_logs" ORDER BY "accessTimestamp" DESC LIMIT ?',
      [limit]
    )

    const presences = await Promise.all(
      result.rows.map(async (presence) => {
        const event = await query(
          'SELECT * FROM "Event" WHERE id = ?',
          [presence.eventId]
        )

        const org = await query(
          'SELECT * FROM "Organization" WHERE id = ?',
          [event.rows[0].organizationId]
        )

        let endUser = null
        if (presence.endUserId) {
          const user = await query(
            'SELECT * FROM "end_users" WHERE id = ?',
            [presence.endUserId]
          )
          endUser = user.rows[0] || null
        }

        return {
          ...presence,
          event: {
            ...event.rows[0],
            organization: org.rows[0]
          },
          endUser
        }
      })
    )

    return presences
  }
}

export const presenceService = new PresenceService()
