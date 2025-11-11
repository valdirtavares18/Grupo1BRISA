import { query } from '@/lib/db-sqlite'

export class PresenceService {
  async logPresence(data: {
    eventId: string
    endUserId?: string
    ipAddress?: string
    userAgent?: string
    initialScanToken: string
  }) {
    const id = require('crypto').randomUUID()

    await query(
      'INSERT INTO "presence_logs" (id, "eventId", "endUserId", "ipAddress", "userAgent", "initialScanToken") VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.eventId, data.endUserId || null, data.ipAddress || null, data.userAgent || null, data.initialScanToken]
    )

    const result = await query(
      'SELECT * FROM "presence_logs" WHERE id = ?',
      [id]
    )

    return result.rows[0]
  }

  async updatePresenceWithUser(logId: string, endUserId: string) {
    await query(
      'UPDATE "presence_logs" SET "endUserId" = ? WHERE id = ?',
      [endUserId, logId]
    )

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
    const total = await query(
      'SELECT COUNT(*) as count FROM "presence_logs" WHERE "eventId" = ?',
      [eventId]
    )

    const withUser = await query(
      'SELECT COUNT(*) as count FROM "presence_logs" WHERE "eventId" = ? AND "endUserId" IS NOT NULL',
      [eventId]
    )

    return {
      total: total.rows[0].count || 0,
      identified: withUser.rows[0].count || 0,
      anonymous: (total.rows[0].count || 0) - (withUser.rows[0].count || 0)
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
