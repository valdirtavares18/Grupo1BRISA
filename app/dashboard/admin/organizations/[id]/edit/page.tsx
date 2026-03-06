import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/molecules'
import { organizationService } from '@/services/organization.service'
import { EditOrganizationForm } from '@/components/organisms/edit-organization-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function EditOrganizationPage({ params }: PageProps) {
  const organization = await organizationService.getOrganizationById(params.id)
  
  if (!organization) {
    notFound()
  }

  return (
    <div className="p-4 lg:p-6 lg:py-8 max-w-3xl mx-auto">
        <Link 
          href={`/dashboard/admin/organizations/${params.id}`}
          className="inline-flex items-center gap-2 text-[#C8CDD5] hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>

        <PageHeader
          title="Editar Organização"
          description="Atualize as informações da organização"
        />

        <EditOrganizationForm organization={organization} />
    </div>
  )
}


