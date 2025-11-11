import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { organizationService } from '@/services/organization.service'
import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Calendar, Users, Globe, Palette, CheckCircle, XCircle, Edit } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function OrganizationDetailsPage({ params }: PageProps) {
  const organization = await organizationService.getOrganizationById(params.id)
  
  if (!organization) {
    notFound()
  }

  const events = await eventService.getEventsByOrganization(organization.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar userRole="SUPER ADMIN" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Link 
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Dashboard</span>
        </Link>

        <PageHeader
          title={organization.name}
          description={`Detalhes e configurações da organização`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Info Card */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações da Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-semibold mt-1">{organization.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded mt-1 block">
                    {organization.slug}
                  </code>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {organization.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criada em</label>
                  <p className="text-lg mt-1">
                    {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {organization.theme && (
                <div className="border-t pt-4 mt-4">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4" />
                    Tema Personalizado
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {organization.theme.primaryColor && (
                      <div>
                        <label className="text-xs text-muted-foreground">Cor Primária</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: organization.theme.primaryColor }}
                          />
                          <code className="text-sm">{organization.theme.primaryColor}</code>
                        </div>
                      </div>
                    )}
                    
                    {organization.theme.logoUrl && (
                      <div>
                        <label className="text-xs text-muted-foreground">Logo URL</label>
                        <a 
                          href={organization.theme.logoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block mt-1 truncate"
                        >
                          {organization.theme.logoUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Total de Eventos
                  </span>
                </div>
                <p className="text-3xl font-bold text-primary">{events.length}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Administradores
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {organization._count?.platformUsers || 0}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    URL Pública
                  </span>
                </div>
                <a 
                  href={`/${organization.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  /{organization.slug}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Eventos da Organização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Nenhum evento cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const startDate = new Date(event.startDate)
                  const endDate = new Date(event.endDate)
                  const now = new Date()
                  const isActive = startDate <= now && endDate >= now
                  const isPast = endDate < now
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {startDate.toLocaleDateString('pt-BR')} • {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isActive ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
                        ) : isPast ? (
                          <Badge variant="secondary">Encerrado</Badge>
                        ) : (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Agendado</Badge>
                        )}
                        
                        <span className="text-sm text-muted-foreground">
                          {event._count?.presenceLogs || 0} presenças
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
