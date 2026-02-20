import { query } from '@/lib/db-sqlite'

export class ConsentService {
  async createOrUpdateConsent(
    endUserId: string,
    dataType: string,
    isGiven: boolean
  ) {
    const existing = await query(
      'SELECT * FROM "user_consents" WHERE "endUserId" = ? AND "dataType" = ?',
      [endUserId, dataType]
    )

    if (existing.rows.length > 0) {
      await query(
        'UPDATE "user_consents" SET "isGiven" = ?, "consentTimestamp" = CURRENT_TIMESTAMP WHERE "endUserId" = ? AND "dataType" = ?',
        [isGiven ? 1 : 0, endUserId, dataType]
      )
      return existing.rows[0]
    } else {
      await query(
        'INSERT INTO "user_consents" (id, "endUserId", "dataType", "isGiven") VALUES (?, ?, ?, ?)',
        [require('crypto').randomUUID(), endUserId, dataType, isGiven ? 1 : 0]
      )
      const result = await query(
        'SELECT * FROM "user_consents" WHERE "endUserId" = ? AND "dataType" = ?',
        [endUserId, dataType]
      )
      return result.rows[0]
    }
  }

  async getUserConsents(endUserId: string) {
    const result = await query(
      'SELECT * FROM "user_consents" WHERE "endUserId" = ? ORDER BY "consentTimestamp" DESC',
      [endUserId]
    )
    return result.rows
  }

  async getConsentStatus(endUserId: string, dataType: string) {
    const result = await query(
      'SELECT * FROM "user_consents" WHERE "endUserId" = ? AND "dataType" = ?',
      [endUserId, dataType]
    )

    return result.rows[0]?.isGiven === 1 || false
  }

  async revokeAllConsents(endUserId: string) {
    await query(
      'UPDATE "user_consents" SET "isGiven" = 0, "consentTimestamp" = CURRENT_TIMESTAMP WHERE "endUserId" = ?',
      [endUserId]
    )
  }

  async saveConsent(endUserId: string, dataType: string, isGiven: boolean) {
    return this.createOrUpdateConsent(endUserId, dataType, isGiven)
  }
}

export const consentService = new ConsentService()
