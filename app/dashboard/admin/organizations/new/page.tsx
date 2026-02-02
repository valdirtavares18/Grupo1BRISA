import { CreateOrganizationForm } from '@/components/organisms/create-organization-form'
import { PageHeader } from '@/components/molecules'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewOrganizationPage() {
  return (
    <div className="p-5 lg:p-6 lg:py-8 max-w-2xl mx-auto">
        <Link 
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition text-sm mb-5"
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