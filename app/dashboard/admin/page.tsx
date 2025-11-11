import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { organizationService } from '@/services/organization.service'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const organizations = await organizationService.getAllOrganizations()

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Dashboard Administrador"
        description="Gerencie organizações da plataforma"
        action={
          <Link
            href="/dashboard/admin/organizations/new"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Nova Organização
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Slug: <code>{org.slug}</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  Eventos: {org._count?.events || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Usuários: {org._count?.platformUsers || 0}
                </p>
                <Link
                  href={`/dashboard/admin/organizations/${org.id}`}
                  className="text-primary hover:underline"
                >
                  Ver detalhes →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
