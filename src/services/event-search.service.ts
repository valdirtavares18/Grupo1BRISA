import { query } from '@/lib/db-sqlite'

interface EventSearchFilters {
  city?: string
  state?: string
  zipCode?: string
  eventType?: string
  latitude?: number
  longitude?: number
  radius?: number // em quilômetros
  organizationId?: string
}

export class EventSearchService {
  /**
   * Calcula distância entre duas coordenadas usando fórmula de Haversine
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Busca eventos por localização (CEP do usuário ou coordenadas)
   */
  async searchEventsByLocation(filters: EventSearchFilters) {
    let sql = `
      SELECT e.*, o.name as "organizationName", o.slug as "organizationSlug",
             ot."primaryColor", ot."logoUrl"
      FROM "Event" e
      INNER JOIN "Organization" o ON e."organizationId" = o.id
      LEFT JOIN "organization_themes" ot ON o.id = ot."organizationId"
      WHERE 1=1
        AND e."manuallyEnded" = 0
        AND e."endDate" >= datetime('now')
    `

    const params: any[] = []

    // Filtrar por organização
    if (filters.organizationId) {
      sql += ` AND e."organizationId" = ?`
      params.push(filters.organizationId)
    }

    // Filtrar por cidade
    if (filters.city) {
      sql += ` AND e.city LIKE ?`
      params.push(`%${filters.city}%`)
    }

    // Filtrar por estado
    if (filters.state) {
      sql += ` AND e.state = ?`
      params.push(filters.state.toUpperCase())
    }

    // Filtrar por tipo de evento
    if (filters.eventType) {
      sql += ` AND e."eventType" = ?`
      params.push(filters.eventType)
    }

    // Filtrar por CEP (proximidade)
    if (filters.zipCode) {
      // Buscar eventos no mesmo CEP
      sql += ` AND e."zipCode" LIKE ?`
      params.push(`${filters.zipCode.substring(0, 5)}%`)
    }

    sql += ` ORDER BY e."startDate" ASC`

    const result = await query(sql, params)
    let events = result.rows

    // Se tiver coordenadas e raio, filtrar por distância
    if (filters.latitude && filters.longitude && filters.radius) {
      events = events.filter((event: any) => {
        if (!event.latitude || !event.longitude) return false
        const distance = this.calculateDistance(
          filters.latitude!,
          filters.longitude!,
          event.latitude,
          event.longitude
        )
        return distance <= filters.radius!
      })

      // Ordenar por distância
      events = events.map((event: any) => {
        const distance = this.calculateDistance(
          filters.latitude!,
          filters.longitude!,
          event.latitude,
          event.longitude
        )
        return { ...event, distance }
      }).sort((a: any, b: any) => a.distance - b.distance)
    }

    // Buscar contagem de presenças para cada evento
    const eventsWithCounts = await Promise.all(
      events.map(async (event: any) => {
        const countResult = await query(
          'SELECT COUNT(*) as count FROM presence_logs WHERE "eventId" = ?',
          [event.id]
        )
        return {
          ...event,
          _count: {
            presenceLogs: countResult.rows[0]?.count || 0,
          },
        }
      })
    )

    return eventsWithCounts
  }

  /**
   * Busca eventos por cidade e estado
   */
  async searchEventsByCityState(city?: string, state?: string, eventType?: string) {
    return this.searchEventsByLocation({ city, state, eventType })
  }

  /**
   * Busca eventos por tipo
   */
  async searchEventsByType(eventType: string) {
    return this.searchEventsByLocation({ eventType })
  }

  /**
   * Busca eventos próximos usando coordenadas
   */
  async searchEventsNearby(
    latitude: number,
    longitude: number,
    radius: number = 50 // 50km padrão
  ) {
    return this.searchEventsByLocation({ latitude, longitude, radius })
  }

  /**
   * Busca eventos por CEP (usa coordenadas do CEP se disponível)
   */
  async searchEventsByZipCode(zipCode: string, radius: number = 50) {
    // TODO: Integrar com API de geocodificação para obter lat/long do CEP
    // Por enquanto, busca por CEP exato ou prefixo
    return this.searchEventsByLocation({ zipCode, radius })
  }

  /**
   * Busca todos os tipos de eventos disponíveis
   */
  async getEventTypes() {
    const result = await query(
      'SELECT DISTINCT "eventType" FROM "Event" WHERE "eventType" IS NOT NULL AND "eventType" != "" ORDER BY "eventType"'
    )
    return result.rows.map((row: any) => row.eventType)
  }
}

export const eventSearchService = new EventSearchService()

