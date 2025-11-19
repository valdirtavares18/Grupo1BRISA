import { Navbar } from '@/components/organisms/navbar'
import { CreateFeedPostForm } from '@/components/organisms/create-feed-post-form'
import { PageHeader } from '@/components/molecules'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewFeedPostPage() {
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

      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
        <Link
          href="/dashboard/organization/feed"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Feed</span>
        </Link>

        <PageHeader
          title="Novo Post no Feed"
          description="Crie um post para divulgar eventos e conteúdo da sua organização"
        />

        <CreateFeedPostForm organizationId={payload.organizationId} />
      </div>
    </div>
  )
}

