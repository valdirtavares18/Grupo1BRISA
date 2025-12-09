import { CreateEventForm } from '@/components/organisms/create-event-form'
import { PageHeader } from '@/components/molecules'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  return (
    <div className="p-4 lg:p-6 lg:py-8 max-w-4xl mx-auto">
        <Link 
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para eventos</span>
        </Link>

        <PageHeader
          title="Novo Evento"
          description="Crie um novo evento e gere o QR Code para distribuição"
        />
        <CreateEventForm />
    </div>
  )
}