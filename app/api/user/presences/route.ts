import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'END_USER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const presences = await userService.getUserHistory(payload.userId)
    
    return NextResponse.json(presences)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

