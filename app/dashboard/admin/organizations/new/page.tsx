import { CreateOrganizationForm } from '@/components/organisms/create-organization-form'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <Navbar userRole="SUPER ADMIN" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
        <Link 
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para dashboard</span>
        </Link>

        <PageHeader
          title="Nova Organização"
          description="Crie uma nova organização white-label na plataforma"
        />
        <CreateOrganizationForm />
      </div>
    </div>
  )
}