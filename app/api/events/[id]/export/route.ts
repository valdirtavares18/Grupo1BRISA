import { NextRequest, NextResponse } from 'next/server'
import { exportService } from '@/services/export.service'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@/types'

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
    if (!payload || (payload.role !== UserRole.ORG_ADMIN && payload.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const event = await eventService.getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'xlsx' | 'json' | 'txt'
    const profile = searchParams.get('profile') || undefined

    const exported = await exportService.exportEventData(params.id, format, profile)

    const filename = `presencas-${event.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${exported.extension}`

    if (format === 'xlsx') {
      const buf = Buffer.isBuffer(exported.content)
        ? exported.content
        : Buffer.from(exported.content as unknown as ArrayBuffer)
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': exported.mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

    return new NextResponse(exported.content as string, {
      headers: {
        'Content-Type': exported.mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}