import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const payload = verifyToken(token)

        if (!payload || !payload.role || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(payload.role)) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const body = await req.json()
        const { currentPassword, newPassword, confirmNewPassword } = body

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
        }

        if (newPassword !== confirmNewPassword) {
            return NextResponse.json({ error: 'As novas senhas não coincidem' }, { status: 400 })
        }

        await authService.changePlatformUserPassword(payload.userId, currentPassword, newPassword)

        return NextResponse.json({ message: 'Senha alterada com sucesso' })
    } catch (error: any) {
        console.error('Erro ao alterar senha:', error)
        return NextResponse.json(
            { error: error.message || 'Erro interno ao processar requisição' },
            { status: 400 }
        )
    }
}
