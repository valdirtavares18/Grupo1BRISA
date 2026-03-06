import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
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
    <div className="p-4 lg:p-6 lg:py-8">
        <Link
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-[#C8CDD5] hover:text-white transition mb-6"
        >
          ← Voltar para Dashboard
        </Link>

        <PageHeader
          title="Feed da Organização"
          description="Gerencie posts e conteúdo para divulgar sua marca e eventos"
          action={
            <Link href="/dashboard/organization/feed/new">
              <div className="bg-mustard text-ink px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-mustard transition shadow-md flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Post</span>
                <span className="sm:hidden">Novo</span>
              </div>
            </Link>
          }
        />

        <FeedManagement organizationId={payload.organizationId} />
    </div>
  )
}

