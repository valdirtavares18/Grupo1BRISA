import { query } from '@/lib/db-sqlite'
import * as XLSX from 'xlsx'

export class ExportService {
  async exportEventData(eventId: string, format: 'csv' | 'xlsx' | 'json' | 'txt', profile?: string) {
    // Buscar presenças
    let sql = `
      SELECT pl.*, eu."fullName", eu.cpf, eu.phone, eu.email, e.title as "eventTitle"
      FROM "presence_logs" pl
      LEFT JOIN "end_users" eu ON pl."endUserId" = eu.id
      INNER JOIN "Event" e ON pl."eventId" = e.id
      WHERE pl."eventId" = ?
    `
    const params: any[] = [eventId]

    if (profile) {
      sql += ' AND pl.profile = ?'
      params.push(profile)
    }

    sql += ' ORDER BY pl."accessTimestamp" DESC'

    const result = await query(sql, params)

    const data = result.rows.map((row: any) => ({
      'Data/Hora': new Date(row.accessTimestamp).toLocaleString('pt-BR'),
      'Nome': row.fullName || 'Anônimo',
      'CPF': row.cpf || '-',
      'Email': row.email || '-',
      'Telefone': row.phone || '-',
      'Perfil': row.profile || '-',
      'IP': row.ipAddress || '-',
      'Status': row.endUserId ? 'Identificado' : 'Anônimo',
      'Evento': row.eventTitle
    }))

    switch (format) {
      case 'csv':
        return this.toCSV(data)
      case 'xlsx':
        return this.toXLSX(data)
      case 'json':
        return this.toJSON(data)
      case 'txt':
        return this.toTXT(data)
      default:
        throw new Error('Formato não suportado')
    }
  }

  private toCSV(data: any[]): { content: string; mimeType: string; extension: string } {
    if (data.length === 0) {
      return { content: '', mimeType: 'text/csv', extension: 'csv' }
    }

    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(','))
    
    return {
      content: [headers.join(','), ...rows].join('\n'),
      mimeType: 'text/csv; charset=utf-8',
      extension: 'csv'
    }
  }

  private toXLSX(data: any[]): { content: Buffer; mimeType: string; extension: string } {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presenças')
    
    return {
      content: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx'
    }
  }

  private toJSON(data: any[]): { content: string; mimeType: string; extension: string } {
    return {
      content: JSON.stringify(data, null, 2),
      mimeType: 'application/json',
      extension: 'json'
    }
  }

  private toTXT(data: any[]): { content: string; mimeType: string; extension: string } {
    if (data.length === 0) {
      return { content: '', mimeType: 'text/plain', extension: 'txt' }
    }

    const headers = Object.keys(data[0])
    const lines = [
      headers.join(' | '),
      '-'.repeat(headers.join(' | ').length),
      ...data.map(row => headers.map(header => String(row[header] || '-')).join(' | '))
    ]

    return {
      content: lines.join('\n'),
      mimeType: 'text/plain',
      extension: 'txt'
    }
  }
}

export const exportService = new ExportService()


