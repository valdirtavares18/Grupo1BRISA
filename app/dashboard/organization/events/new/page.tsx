import { CreateEventForm } from '@/components/organisms/create-event-form'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      <Navbar userRole="ADMIN ORGANIZAÇÃO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        <Link 
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
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
    </div>
  )
}