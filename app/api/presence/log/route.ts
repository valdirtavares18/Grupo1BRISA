import { NextRequest, NextResponse } from 'next/server'
import { presenceService } from '@/services/presence.service'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, endUserId } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'EventId é obrigatório' },
        { status: 400 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let userId = endUserId
    if (!userId) {
      const token = request.cookies.get('token')?.value
      if (token) {
        const payload = verifyToken(token)
        if (payload && payload.role === 'END_USER') {
          userId = payload.userId
        }
      }
    }

    const initialScanToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const log = await presenceService.logPresence({
      eventId,
      endUserId: userId,
      ipAddress,
      userAgent,
      initialScanToken,
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
