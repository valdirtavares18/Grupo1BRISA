import { Navbar } from '@/components/organisms/navbar'
import { CreateFeedPostForm } from '@/components/organisms/create-feed-post-form'
import { PageHeader } from '@/components/molecules'
import { feedService } from '@/services/feed.service'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { feedId: string }
}

export default async function EditFeedPostPage({ params }: PageProps) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'ORG_ADMIN' || !payload.organizationId) {
    redirect('/login')
  }

  const feedPost = await feedService.getFeedPostById(params.feedId)

  if (!feedPost || feedPost.organizationId !== payload.organizationId) {
    notFound()
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
          title="Editar Post"
          description="Atualize o conteúdo do post"
        />

        <CreateFeedPostForm
          organizationId={payload.organizationId}
          initialData={{
            id: feedPost.id,
            title: feedPost.title,
            content: feedPost.content,
            imageUrl: feedPost.imageUrl || undefined,
            published: feedPost.published,
          }}
        />
      </div>
    </div>
  )
}

