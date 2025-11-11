import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload) {
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
