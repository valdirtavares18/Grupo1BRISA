import { query } from '@/lib/db-sqlite'
import { randomUUID } from 'crypto'

export class EventService {
  async createEvent(data: {
    organizationId: string
    title: string
    description?: string
    startDate: Date
    endDate: Date
    address?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
    eventType?: string
    reward?: string
  }) {
    // Garantir que as datas são objetos Date válidos
    const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
    const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)
    
    // Validar que as datas são válidas
    if (isNaN(startDate.getTime())) {
      throw new Error('Data de início inválida')
    }
    if (isNaN(endDate.getTime())) {
      throw new Error('Data de término inválida')
    }
    
    // Validar que a data de início não é anterior à data atual
    const now = new Date()
    if (startDate < now) {
      throw new Error('A data do evento não pode ser anterior à data atual')
    }

    // Validar que a data de término é posterior à de início
    if (endDate <= startDate) {
      throw new Error('A data de término deve ser posterior à data de início')
    }

    // Validar campos obrigatórios
    if (!data.title || data.title.trim() === '') {
      throw new Error('O título do evento é obrigatório')
    }

    if (!data.organizationId) {
      throw new Error('A organização é obrigatória')
    }

    const qrCodeToken = randomUUID()
    const id = randomUUID()

    await query(
      'INSERT INTO "Event" (id, "organizationId", title, description, "startDate", "endDate", "qrCodeToken", address, city, state, "zipCode", latitude, longitude, "eventType", reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.organizationId,
        data.title,
        data.description || null,
        startDate.toISOString(),
        endDate.toISOString(),
        qrCodeToken,
        data.address || null,
        data.city || null,
        data.state || null,
        data.zipCode || null,
        data.latitude || null,
        data.longitude || null,
        data.eventType || null,
        data.reward || null,
      ]
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
    address?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    eventType?: string | null
    reward?: string | null
  }) {
    const updates: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description || null)
    }
    if (data.startDate) {
      updates.push('"startDate" = ?')
      values.push(data.startDate.toISOString())
    }
    if (data.endDate) {
      updates.push('"endDate" = ?')
      values.push(data.endDate.toISOString())
    }
    if (data.address !== undefined) {
      updates.push('address = ?')
      values.push(data.address || null)
    }
    if (data.city !== undefined) {
      updates.push('city = ?')
      values.push(data.city || null)
    }
    if (data.state !== undefined) {
      updates.push('state = ?')
      values.push(data.state || null)
    }
    if (data.zipCode !== undefined) {
      updates.push('"zipCode" = ?')
      values.push(data.zipCode || null)
    }
    if (data.eventType !== undefined) {
      updates.push('"eventType" = ?')
      values.push(data.eventType || null)
    }
    if (data.reward !== undefined) {
      updates.push('reward = ?')
      values.push(data.reward || null)
    }

    if (updates.length > 0) {
      values.push(eventId)
      await query(`UPDATE "Event" SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    return this.getEventById(eventId)
  }

  async deleteEvent(eventId: string) {
    await query('DELETE FROM "Event" WHERE id = ?', [eventId])
  }

  async duplicateEvent(eventId: string) {
    // Buscar evento original
    const originalEvent = await this.getEventById(eventId)
    
    if (!originalEvent) {
      throw new Error('Evento não encontrado')
    }

    // Criar novo evento com dados do original
    const now = new Date()
    const startDate = new Date(originalEvent.startDate)
    const endDate = new Date(originalEvent.endDate)
    
    // Ajustar datas para serem futuras (adicionar 7 dias)
    const newStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const duration = endDate.getTime() - startDate.getTime()
    const newEndDate = new Date(newStartDate.getTime() + duration)

    const newEvent = await this.createEvent({
      organizationId: originalEvent.organizationId,
      title: `${originalEvent.title} (Cópia)`,
      description: originalEvent.description,
      startDate: newStartDate,
      endDate: newEndDate
    })

    return newEvent
  }
}

export const eventService = new EventService()
