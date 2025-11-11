import { CreateOrganizationForm } from '@/components/organisms/create-organization-form'
import { PageHeader } from '@/components/molecules'

export default function NewOrganizationPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <PageHeader
        title="Nova Organização"
        description="Crie uma nova organização na plataforma"
      />
      <CreateOrganizationForm />
    </div>
  )
}
