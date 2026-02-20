import { NextRequest, NextResponse } from 'next/server'
import { passwordResetService } from '@/services/password-reset.service'

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    await passwordResetService.resetPassword(userId, newPassword)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

