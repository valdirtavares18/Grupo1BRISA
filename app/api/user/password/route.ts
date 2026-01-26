import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'END_USER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    await userService.changePassword(payload.userId, currentPassword, newPassword)

    return NextResponse.json({ message: 'Senha alterada com sucesso' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}