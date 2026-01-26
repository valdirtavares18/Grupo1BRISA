import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { DashboardLayoutClient } from '@/components/organisms/dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload) {
    redirect('/login')
  }

  // Verificar se o role é válido
  const validRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'END_USER']
  if (!validRoles.includes(payload.role)) {
    redirect('/login')
  }

  return (
    <DashboardLayoutClient
      userRole={payload.role as 'SUPER_ADMIN' | 'ORG_ADMIN' | 'END_USER'}
      userEmail={payload.email}
    >
      {children}
    </DashboardLayoutClient>
  )
}

