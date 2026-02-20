import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        role: payload.role,
        email: payload.email,
        userId: payload.userId,
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 200 }
    )
  }
}

