import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logout realizado com sucesso' })
  
  // Remove o cookie do token
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expira imediatamente
  })
  
  return response
}
