import { NextRequest, NextResponse } from 'next/server'
import { presenceService } from '@/services/presence.service'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'ORG_ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const event = await eventService.getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const presences = await presenceService.getPresenceLogsByEvent(params.id)

    // Gerar CSV
    const csvHeaders = 'Data/Hora,Nome,CPF,Email,Telefone,IP,Status\n'
    const csvRows = presences.map(p => {
      const date = new Date(p.accessTimestamp).toLocaleString('pt-BR')
      const name = p.endUser?.fullName || 'Anônimo'
      const cpf = p.endUser?.cpf || '-'
      const email = p.endUser?.email || '-'
      const phone = p.endUser?.phone || '-'
      const ip = p.ipAddress || '-'
      const status = p.endUser ? 'Identificado' : 'Anônimo'
      
      return `"${date}","${name}","${cpf}","${email}","${phone}","${ip}","${status}"`
    }).join('\n')

    const csv = csvHeaders + csvRows

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="presencas-${event.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}