import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { verifyToken } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'END_USER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await userService.deleteAccount(payload.userId)

    const response = NextResponse.json({ message: 'Conta excluída com sucesso' })
    response.cookies.delete('token')

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
