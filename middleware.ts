import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)
    
    if (payload.organizationId) {
      response.headers.set('x-organization-id', payload.organizationId)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
}
