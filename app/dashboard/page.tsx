import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  console.log('🔵 [Dashboard] Token presente:', !!token)
  console.log('🔵 [Dashboard] Token length:', token?.length || 0)

  if (!token) {
    console.log('❌ [Dashboard] Token não encontrado, redirecionando para login')
    redirect('/login')
  }

  const payload = verifyToken(token)
  
  console.log('🔵 [Dashboard] Payload:', payload ? { role: payload.role, email: payload.email } : 'null')

  if (!payload) {
    console.log('❌ [Dashboard] Token inválido, redirecionando para login')
    redirect('/login')
  }

  if (payload.role === 'SUPER_ADMIN') {
    redirect('/dashboard/admin')
  }

  if (payload.role === 'ORG_ADMIN') {
    redirect('/dashboard/organization')
  }

  redirect('/dashboard/user')
}
