import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { DeleteOrganizationButton } from '@/components/organisms/delete-organization-button'
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
    <div className="p-6 lg:p-10 lg:py-12 max-w-7xl mx-auto">
        <Link 
          href="/dashboard/admin"
          className="inline-flex items-center gap-3 text-white/90 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg">Voltar para Dashboard</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-white">{organization.name}</h1>
          <p className="text-2xl text-white/90">Detalhes e configurações da organização</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {/* Info Card */}
          <Card className="hover:bg-white/15 hover:shadow-2xl transition-all flex-1 lg:flex-[2]">
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Building2 className="w-7 h-7" />
                Informações da Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-base font-semibold text-white/80 mb-2 block">Nome</label>
                  <p className="text-2xl font-bold mt-2 text-white">{organization.name}</p>
                </div>

                <div>
                  <label className="text-base font-semibold text-white/80 mb-2 block">Slug</label>
                  <code className="text-xl font-mono bg-white/15 px-4 py-2 rounded-xl mt-2 block border-2 border-white/30 text-white">
                    {organization.slug}
                  </code>
                </div>

                <div>
                  <label className="text-base font-semibold text-white/80 mb-2 block">Status</label>
                  <div className="mt-2">
                    {organization.isActive ? (
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 text-base px-4 py-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-white/10 text-white/80 border-2 border-white/20 text-base px-4 py-2">
                        <XCircle className="w-5 h-5 mr-2" />
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-base font-semibold text-white/80 mb-2 block">Criada em</label>
                  <p className="text-2xl font-bold mt-2 text-white">
                    {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {organization.theme && (
                <div className="border-t-2 border-white/30 pt-6 mt-6">
                  <label className="text-xl font-semibold text-white flex items-center gap-3 mb-4">
                    <Palette className="w-6 h-6" />
                    Tema Personalizado
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {organization.theme.primaryColor && (
                      <div>
                        <label className="text-base text-white/80 mb-3 block">Cor Primária</label>
                        <div className="flex items-center gap-4 mt-2">
                          <div 
                            className="w-16 h-16 rounded-xl border-2 border-white/40 shadow-lg"
                            style={{ backgroundColor: organization.theme.primaryColor }}
                          />
                          <code className="text-lg text-white font-mono font-semibold">{organization.theme.primaryColor}</code>
                        </div>
                      </div>
                    )}
                    
                    {organization.theme.logoUrl && (
                      <div>
                        <label className="text-base text-white/80 mb-3 block">Logo URL</label>
                        <a 
                          href={organization.theme.logoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg text-yellow-400 hover:text-yellow-300 hover:underline block mt-2 truncate font-medium"
                        >
                          {organization.theme.logoUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="border-t-2 border-white/30 pt-8 mt-8 space-y-4">
                <Button variant="outline" className="w-full h-16 text-lg border-2 border-white/40 text-white hover:bg-white/25 bg-white/15 font-semibold" asChild>
                  <Link href={`/dashboard/admin/organizations/${organization.id}/edit`}>
                    <Edit className="w-6 h-6 mr-3" />
                    Editar Organização
                  </Link>
                </Button>

                <DeleteOrganizationButton 
                  organizationId={organization.id}
                  organizationName={organization.name}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="hover:bg-white/15 hover:shadow-2xl transition-all flex-1 lg:flex-none lg:w-96 lg:min-w-96">
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-2xl text-white font-bold">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-base font-semibold text-white/90 flex items-center gap-3">
                    <Calendar className="w-6 h-6 flex-shrink-0" />
                    <span className="break-words">Total de Eventos</span>
                  </span>
                </div>
                <p className="text-5xl font-bold text-white break-words">{events.length}</p>
              </div>

              <div className="border-t-2 border-white/30 pt-6">
                <div className="flex items-center mb-4">
                  <span className="text-base font-semibold text-white/90 flex items-center gap-3">
                    <Users className="w-6 h-6 flex-shrink-0" />
                    <span className="break-words">Administradores</span>
                  </span>
                </div>
                <p className="text-5xl font-bold text-white break-words">
                  {organization._count?.platformUsers || 0}
                </p>
              </div>

              <div className="border-t-2 border-white/30 pt-6">
                <div className="flex items-center mb-4">
                  <span className="text-base font-semibold text-white/90 flex items-center gap-3">
                    <Globe className="w-6 h-6 flex-shrink-0" />
                    <span className="break-words">URL Pública</span>
                  </span>
                </div>
                <a 
                  href={`/${organization.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-yellow-400 hover:text-yellow-300 hover:underline font-semibold break-all"
                >
                  /{organization.slug}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card className="hover:bg-white/15 hover:shadow-2xl transition-all">
          <CardHeader className="pb-6 pt-8">
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              <Calendar className="w-7 h-7" />
              Eventos da Organização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-20 h-20 text-white/40 mx-auto mb-6" />
                <p className="text-xl text-white/90">Nenhum evento cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const startDate = new Date(event.startDate)
                  const endDate = new Date(event.endDate)
                  const now = new Date()
                  const isActive = startDate <= now && endDate >= now
                  const isPast = endDate < now
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-6 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/15 transition"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white mb-2">{event.title}</h4>
                        <p className="text-base text-white/90">
                          {startDate.toLocaleDateString('pt-BR')} • {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {isActive ? (
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 text-base px-4 py-2">Ativo</Badge>
                        ) : isPast ? (
                          <Badge variant="secondary" className="bg-white/10 text-white/80 border-2 border-white/20 text-base px-4 py-2">Encerrado</Badge>
                        ) : (
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 text-base px-4 py-2">Agendado</Badge>
                        )}
                        
                        <span className="text-base text-white/90 font-medium">
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
  )
}
