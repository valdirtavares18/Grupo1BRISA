import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { FeedManagement } from '@/components/organisms/feed-management'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function OrganizationFeedPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'ORG_ADMIN' || !payload.organizationId) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <Navbar userRole="ADMIN ORGANIZAÇÃO" userName={payload.email} />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Link
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          ← Voltar para Dashboard
        </Link>

        <PageHeader
          title="Feed da Organização"
          description="Gerencie posts e conteúdo para divulgar sua marca e eventos"
          action={
            <Link href="/dashboard/organization/feed/new">
              <div className="bg-primary text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-primary/90 transition shadow-lg hover:shadow-xl flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Post</span>
                <span className="sm:hidden">Novo</span>
              </div>
            </Link>
          }
        />

        <FeedManagement organizationId={payload.organizationId} />
      </div>
    </div>
  )
}

