import { CreateOrganizationForm } from '@/components/organisms/create-organization-form'
import { PageHeader } from '@/components/molecules'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewOrganizationPage() {
  return (
    <div className="p-6 lg:p-8 lg:py-10 max-w-4xl mx-auto">
        <Link 
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
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
  )
}