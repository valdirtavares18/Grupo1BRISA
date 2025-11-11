import { query } from '@/lib/db-sqlite'

export class EventService {
  async createEvent(data: {
    organizationId: string
    title: string
    description?: string
    startDate: Date
    endDate: Date
  }) {
    const qrCodeToken = require('crypto').randomUUID()
    const id = require('crypto').randomUUID()

    await query(
      'INSERT INTO "Event" (id, "organizationId", title, description, "startDate", "endDate", "qrCodeToken") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.organizationId, data.title, data.description || null, data.startDate.toISOString(), data.endDate.toISOString(), qrCodeToken]
    )

    const result = await query(
      'SELECT * FROM "Event" WHERE id = ?',
      [id]
    )

    const org = await query(
      'SELECT * FROM "Organization" WHERE id = ?',
      [data.organizationId]
    )

    return {
      ...result.rows[0],
      organization: org.rows[0]
    }
  }

  async getEventsByOrganization(organizationId: string) {
    const result = await query(
      'SELECT * FROM "Event" WHERE "organizationId" = ? ORDER BY "startDate" DESC',
      [organizationId]
    )

    const events = await Promise.all(
      result.rows.map(async (event) => {
        const count = await query(
          'SELECT COUNT(*) as count FROM "presence_logs" WHERE "eventId" = ?',
          [event.id]
        )

        return {
          ...event,
          _count: {
            presenceLogs: count.rows[0].count || 0
          }
        }
      })
    )

    return events
  }

  async getEventById(eventId: string) {
    const result = await query(
      'SELECT * FROM "Event" WHERE id = ?',
      [eventId]
    )

    if (result.rows.length === 0) return null

    const event = result.rows[0]

    const org = await query(
      'SELECT * FROM "Organization" WHERE id = ?',
      [event.organizationId]
    )

    const theme = await query(
      'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
      [event.organizationId]
    )

    const count = await query(
      'SELECT COUNT(*) as count FROM "presence_logs" WHERE "eventId" = ?',
      [eventId]
    )

    return {
      ...event,
      organization: {
        ...org.rows[0],
        theme: theme.rows[0] || null
      },
      _count: {
        presenceLogs: count.rows[0].count || 0
      }
    }
  }

  async getEventByQrToken(qrCodeToken: string) {
    const result = await query(
      'SELECT * FROM "Event" WHERE "qrCodeToken" = ?',
      [qrCodeToken]
    )

    if (result.rows.length === 0) return null

    const event = result.rows[0]

    const org = await query(
      'SELECT * FROM "Organization" WHERE id = ?',
      [event.organizationId]
    )

    const theme = await query(
      'SELECT * FROM "organization_themes" WHERE "organizationId" = ?',
      [event.organizationId]
    )

    return {
      ...event,
      organization: {
        ...org.rows[0],
        theme: theme.rows[0] || null
      }
    }
  }

  async updateEvent(eventId: string, data: {
    title?: string
    description?: string
    startDate?: Date
    endDate?: Date
  }) {
    if (data.title) {
      await query('UPDATE "Event" SET title = ? WHERE id = ?', [data.title, eventId])
    }
    if (data.description !== undefined) {
      await query('UPDATE "Event" SET description = ? WHERE id = ?', [data.description, eventId])
    }
    if (data.startDate) {
      await query('UPDATE "Event" SET "startDate" = ? WHERE id = ?', [data.startDate.toISOString(), eventId])
    }
    if (data.endDate) {
      await query('UPDATE "Event" SET "endDate" = ? WHERE id = ?', [data.endDate.toISOString(), eventId])
    }

    return this.getEventById(eventId)
  }

  async deleteEvent(eventId: string) {
    await query('DELETE FROM "Event" WHERE id = ?', [eventId])
  }
}

export const eventService = new EventService()
