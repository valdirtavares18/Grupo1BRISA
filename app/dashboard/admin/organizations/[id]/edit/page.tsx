import { notFound } from 'next/navigation'
import { Navbar } from '@/components/organisms/navbar'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar userRole="SUPER ADMIN" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
        <Link 
          href={`/dashboard/admin/organizations/${params.id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
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
    </div>
  )
}


