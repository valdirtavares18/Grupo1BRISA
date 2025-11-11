import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'

export default async function UserDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Meus Eventos" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Escaneie QR Codes de eventos para registrar sua presença.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
