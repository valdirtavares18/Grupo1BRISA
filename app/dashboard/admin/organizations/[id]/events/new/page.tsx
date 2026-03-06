import { CreateEventForm } from '@/components/organisms/create-event-form'
import { PageHeader } from '@/components/molecules'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: { id: string }
}

export default function AdminNewEventPage({ params }: PageProps) {
    return (
        <div className="p-4 lg:p-6 lg:py-8 max-w-4xl mx-auto">
            <Link
                href={`/dashboard/admin/organizations/${params.id}`}
                className="inline-flex items-center gap-2 text-[#C8CDD5] hover:text-white transition mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para organização</span>
            </Link>

            <PageHeader
                title="Novo Evento Administrativo"
                description="Crie um novo evento para esta organização"
            />
            <CreateEventForm organizationId={params.id} />
        </div>
    )
}
