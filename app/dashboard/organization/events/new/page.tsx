import { CreateEventForm } from '@/components/organisms/create-event-form'
import { PageHeader } from '@/components/molecules'

export default function NewEventPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <PageHeader
        title="Novo Evento"
        description="Crie um novo evento para sua organização"
      />
      <CreateEventForm />
    </div>
  )
}
