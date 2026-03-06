import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db-sqlite'
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

  const validRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'END_USER']
  if (!validRoles.includes(payload.role)) {
    redirect('/login')
  }

  let userName = payload.email
  let userPhotoUrl: string | undefined

  try {
    if (payload.role === 'END_USER') {
      const result = await query(
        'SELECT "fullName", "profilePhotoUrl" FROM end_users WHERE id = ?',
        [payload.userId]
      )
      if (result.rows.length > 0) {
        const user = result.rows[0] as any
        userName = user.fullName || payload.email
        userPhotoUrl = user.profilePhotoUrl || undefined
      }
    } else if (payload.role === 'ORG_ADMIN' && payload.organizationId) {
      const result = await query(
        'SELECT name FROM "Organization" WHERE id = ?',
        [payload.organizationId]
      )
      if (result.rows.length > 0) {
        userName = (result.rows[0] as any).name || payload.email
      }
    } else if (payload.role === 'SUPER_ADMIN') {
      userName = 'Super Admin'
    }
  } catch {
    // fallback to email
  }

  return (
    <DashboardLayoutClient
      userRole={payload.role as 'SUPER_ADMIN' | 'ORG_ADMIN' | 'END_USER'}
      userName={userName}
      userPhotoUrl={userPhotoUrl}
    >
      {children}
    </DashboardLayoutClient>
  )
}

