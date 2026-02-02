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
    <div className="p-5 lg:p-6 lg:py-8 max-w-7xl mx-auto">
        <Link 
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-white/90 hover:text-white transition text-base mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Dashboard</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-white">{organization.name}</h1>
          <p className="text-lg text-white/90">Detalhes e configurações da organização</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Info Card */}
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all flex-1 lg:flex-[2]">
            <CardHeader className="pb-5 pt-6">
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <Building2 className="w-6 h-6" />
                Informações da Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-white/80 mb-1.5 block">Nome</label>
                  <p className="text-lg font-bold mt-1 text-white">{organization.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-white/80 mb-1.5 block">Slug</label>
                  <code className="text-base font-mono bg-white/15 px-3 py-1.5 rounded-lg mt-1 block border border-white/30 text-white">
                    {organization.slug}
                  </code>
                </div>

                <div>
                  <label className="text-sm font-semibold text-white/80 mb-1.5 block">Status</label>
                  <div className="mt-1">
                    {organization.isActive ? (
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/40 text-sm px-3 py-1.5">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-white/10 text-white/80 border border-white/20 text-sm px-3 py-1.5">
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-white/80 mb-1.5 block">Criada em</label>
                  <p className="text-lg font-bold mt-1 text-white">
                    {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {organization.theme && (
                <div className="border-t border-white/30 pt-5 mt-5">
                  <label className="text-base font-semibold text-white flex items-center gap-2 mb-3">
                    <Palette className="w-5 h-5" />
                    Tema Personalizado
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {organization.theme.primaryColor && (
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Cor Primária</label>
                        <div className="flex items-center gap-3 mt-1">
                          <div 
                            className="w-12 h-12 rounded-lg border border-white/40"
                            style={{ backgroundColor: organization.theme.primaryColor }}
                          />
                          <code className="text-sm text-white font-mono font-semibold">{organization.theme.primaryColor}</code>
                        </div>
                      </div>
                    )}
                    
                    {organization.theme.logoUrl && (
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Logo URL</label>
                        <a 
                          href={organization.theme.logoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-yellow-400 hover:text-yellow-300 hover:underline block mt-1 truncate font-medium"
                        >
                          {organization.theme.logoUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="border-t border-white/30 pt-6 mt-6 space-y-3">
                <Button variant="outline" className="w-full h-11 text-base border-2 border-white/40 text-white hover:bg-white/25 bg-white/15 font-semibold" asChild>
                  <Link href={`/dashboard/admin/organizations/${organization.id}/edit`}>
                    <Edit className="w-5 h-5 mr-2" />
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
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all flex-1 lg:flex-none lg:w-80 lg:min-w-80">
            <CardHeader className="pb-5 pt-6">
              <CardTitle className="text-xl text-white font-bold">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="break-words">Total de Eventos</span>
                  </span>
                </div>
                <p className="text-4xl font-bold text-white break-words">{events.length}</p>
              </div>

              <div className="border-t border-white/30 pt-5">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span className="break-words">Administradores</span>
                  </span>
                </div>
                <p className="text-4xl font-bold text-white break-words">
                  {organization._count?.platformUsers || 0}
                </p>
              </div>

              <div className="border-t border-white/30 pt-5">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Globe className="w-5 h-5 flex-shrink-0" />
                    <span className="break-words">URL Pública</span>
                  </span>
                </div>
                <a 
                  href={`/${organization.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-yellow-400 hover:text-yellow-300 hover:underline font-semibold break-all"
                >
                  /{organization.slug}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all">
          <CardHeader className="pb-5 pt-6">
            <CardTitle className="flex items-center gap-2 text-white text-xl">
              <Calendar className="w-6 h-6" />
              Eventos da Organização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-base text-white/90">Nenhum evento cadastrado ainda</p>
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
                      className="flex items-center justify-between p-4 rounded-xl border border-white/30 bg-white/10 hover:bg-white/15 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-white mb-1">{event.title}</h4>
                        <p className="text-sm text-white/90">
                          {startDate.toLocaleDateString('pt-BR')} • {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {isActive ? (
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/40 text-sm px-3 py-1.5">Ativo</Badge>
                        ) : isPast ? (
                          <Badge variant="secondary" className="bg-white/10 text-white/80 border border-white/20 text-sm px-3 py-1.5">Encerrado</Badge>
                        ) : (
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/40 text-sm px-3 py-1.5">Agendado</Badge>
                        )}
                        
                        <span className="text-sm text-white/90 font-medium">
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
