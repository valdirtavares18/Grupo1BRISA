import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = req.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const payload = verifyToken(token)

        if (!payload || payload.role !== 'ORG_ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const event = await eventService.getEventById(params.id)

        if (!event) {
            return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
        }

        if (event.organizationId !== payload.organizationId) {
            return NextResponse.json({ error: 'Acesso negado a este evento' }, { status: 403 })
        }

        await eventService.deleteEvent(params.id)

        return NextResponse.json({ message: 'Evento excluído com sucesso' })
    } catch (error: any) {
        console.error('Erro ao excluir evento:', error)
        return NextResponse.json(
            { error: 'Erro interno ao processar requisição' },
            { status: 500 }
        )
    }
}
