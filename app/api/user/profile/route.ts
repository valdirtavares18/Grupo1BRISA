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

    const { query } = await import('@/lib/db-sqlite')
    const result = await query('SELECT * FROM end_users WHERE id = ?', [payload.userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const user: any = result.rows[0]
    delete user.passwordHash

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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
    // Simple log to check payload size
    console.log(`[Profile Update] Received payload size: ${JSON.stringify(body).length} characters`)
    console.log(`[Profile Update] User ID: ${payload.userId}`)

    const user: any = await userService.updateProfile(payload.userId, body)

    delete user.passwordHash

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}