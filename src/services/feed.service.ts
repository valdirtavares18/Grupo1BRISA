import { query } from '@/lib/db-sqlite'

export class FeedService {
  /**
   * Criar post no feed da organização
   */
  async createFeedPost(data: {
    organizationId: string
    title: string
    content: string
    imageUrl?: string
    published?: boolean
  }) {
    if (!data.title || data.title.trim() === '') {
      throw new Error('O título é obrigatório')
    }

    if (!data.content || data.content.trim() === '') {
      throw new Error('O conteúdo é obrigatório')
    }

    const id = require('crypto').randomUUID()

    await query(
      'INSERT INTO "organization_feeds" (id, "organizationId", title, content, "imageUrl", published, "updatedAt") VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [
        id,
        data.organizationId,
        data.title,
        data.content,
        data.imageUrl || null,
        data.published !== undefined ? (data.published ? 1 : 0) : 1,
      ]
    )

    return this.getFeedPostById(id)
  }

  /**
   * Buscar post por ID
   */
  async getFeedPostById(id: string) {
    const result = await query(
      'SELECT * FROM "organization_feeds" WHERE id = ?',
      [id]
    )

    if (result.rows.length === 0) return null

    return {
      ...result.rows[0],
      published: result.rows[0].published === 1,
    }
  }

  /**
   * Buscar feed da organização
   */
  async getFeedByOrganization(
    organizationId: string,
    publishedOnly: boolean = false
  ) {
    let sql = 'SELECT * FROM "organization_feeds" WHERE "organizationId" = ?'
    const params: any[] = [organizationId]

    if (publishedOnly) {
      sql += ' AND published = 1'
    }

    sql += ' ORDER BY "createdAt" DESC'

    const result = await query(sql, params)

    return result.rows.map((row: any) => ({
      ...row,
      published: row.published === 1,
    }))
  }

  /**
   * Buscar todos os feeds públicos
   */
  async getPublicFeeds(organizationId?: string) {
    let sql = 'SELECT f.*, o.name as "organizationName", o.slug as "organizationSlug", ot."primaryColor", ot."logoUrl" FROM "organization_feeds" f INNER JOIN "Organization" o ON f."organizationId" = o.id LEFT JOIN "organization_themes" ot ON o.id = ot."organizationId" WHERE f.published = 1'

    const params: any[] = []

    if (organizationId) {
      sql += ' AND f."organizationId" = ?'
      params.push(organizationId)
    }

    sql += ' ORDER BY f."createdAt" DESC LIMIT 50'

    const result = await query(sql, params)

    return result.rows.map((row: any) => ({
      ...row,
      published: row.published === 1,
    }))
  }

  /**
   * Atualizar post do feed
   */
  async updateFeedPost(
    id: string,
    data: {
      title?: string
      content?: string
      imageUrl?: string
      published?: boolean
    }
  ) {
    const updates = []
    const values = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }

    if (data.content !== undefined) {
      updates.push('content = ?')
      values.push(data.content)
    }

    if (data.imageUrl !== undefined) {
      updates.push('"imageUrl" = ?')
      values.push(data.imageUrl)
    }

    if (data.published !== undefined) {
      updates.push('published = ?')
      values.push(data.published ? 1 : 0)
    }

    if (updates.length > 0) {
      values.push(id)
      await query(
        `UPDATE "organization_feeds" SET ${updates.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      )
    }

    return this.getFeedPostById(id)
  }

  /**
   * Deletar post do feed
   */
  async deleteFeedPost(id: string) {
    await query('DELETE FROM "organization_feeds" WHERE id = ?', [id])
    return { success: true }
  }
}

export const feedService = new FeedService()

