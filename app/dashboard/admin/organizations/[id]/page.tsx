import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { DeleteOrganizationButton } from '@/components/organisms/delete-organization-button'
import { organizationService } from '@/services/organization.service'
import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Calendar, Users, Globe, Palette, CheckCircle, XCircle, Edit, Plus, Search } from 'lucide-react'

import { QuickStatusToggle } from '@/components/organisms/quick-status-toggle'

interface PageProps {
  params: { id: string }
  searchParams: { q?: string }
}

export default async function OrganizationDetailsPage({ params, searchParams }: PageProps) {
  const organization = await organizationService.getOrganizationById(params.id)

  if (!organization) {
    notFound()
  }

  let events = await eventService.getEventsByOrganization(organization.id)

  // Filtrar eventos se houver busca
  const query = searchParams.q?.toLowerCase()
  if (query) {
    events = events.filter((event: any) =>
      event.title.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
    )
  }

  return (
    <div className="p-5 lg:p-6 lg:py-8 max-w-7xl mx-auto">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition text-base mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para Dashboard</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-white">{organization.name}</h1>
          <p className="text-lg text-white/90">Detalhes e configurações da organização</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
            asChild
          >
            <Link href={`/${organization.slug}`} target="_blank">
              <Globe className="w-4 h-4 mr-2" />
              Ver Página Pública
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Info Card */}
        <div className="flex-1 lg:flex-[2] space-y-6">
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all">
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
                  <label className="text-sm font-semibold text-white/80 mb-1.5 block">Criada em</label>
                  <p className="text-lg font-bold mt-1 text-white">
                    {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Quick Toggle Integrado */}
              <div className="pt-2">
                <QuickStatusToggle
                  organizationId={organization.id}
                  initialStatus={organization.isActive}
                />
              </div>

              {/* Botões de Ação */}
              <div className="border-t border-white/30 pt-6 mt-6 flex flex-wrap gap-3">
                <Button variant="outline" className="flex-1 min-w-[150px] h-11 text-base border-2 border-white/40 text-white hover:bg-white/25 bg-white/15 font-semibold" asChild>
                  <Link href={`/dashboard/admin/organizations/${organization.id}/edit`}>
                    <Edit className="w-5 h-5 mr-2" />
                    Editar Organização
                  </Link>
                </Button>

                <div className="flex-1 min-w-[150px]">
                  <DeleteOrganizationButton
                    organizationId={organization.id}
                    organizationName={organization.name}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preview Card */}
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all overflow-hidden">
            <CardHeader className="pb-5 pt-6">
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <Palette className="w-6 h-6" />
                Identidade Visual (Tema)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-white/70 mb-2 block">Cores</label>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div
                        className="w-12 h-12 rounded-lg border border-white/20 shadow-lg"
                        style={{ backgroundColor: organization.theme?.primaryColor || '#001F3F' }}
                      />
                      <div>
                        <p className="text-xs text-white/50 uppercase font-bold">Cor Primária</p>
                        <code className="text-base text-white font-mono">{organization.theme?.primaryColor || '#001F3F'}</code>
                      </div>
                    </div>
                  </div>

                  {organization.theme?.logoUrl && (
                    <div>
                      <label className="text-sm font-semibold text-white/70 mb-2 block">Logo</label>
                      <div className="p-4 rounded-xl bg-white text-center border border-white/20">
                        <img
                          src={organization.theme.logoUrl}
                          alt="Logo Preview"
                          className="max-h-20 max-w-full mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-white/70 mb-2 block">Prévia da Página</label>
                  <div className="rounded-xl border border-white/20 overflow-hidden shadow-2xl scale-95 origin-top">
                    {/* Mini Mockup */}
                    <div className="h-40 bg-slate-900 overflow-hidden">
                      <div
                        className="h-12 w-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                        style={{ backgroundColor: organization.theme?.primaryColor || '#001F3F' }}
                      >
                        {organization.name}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="h-2 w-3/4 bg-white/10 rounded" />
                        <div className="h-2 w-1/2 bg-white/5 rounded" />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="h-10 rounded bg-white/10" />
                          <div className="h-10 rounded shadow-lg" style={{ backgroundColor: organization.theme?.primaryColor || '#001F3F' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div className="flex-1 lg:flex-none lg:w-80 lg:min-w-80 space-y-6">
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all">
            <CardHeader className="pb-5 pt-6">
              <CardTitle className="text-xl text-white font-bold">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-semibold text-white/90">Total de Eventos</span>
                </div>
                <p className="text-4xl font-bold text-white ml-8">{events.length}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-white/70" />
                  <span className="text-sm font-semibold text-white/90">Administradores</span>
                </div>
                <p className="text-4xl font-bold text-white ml-8">
                  {organization._count?.platformUsers || 0}
                </p>
              </div>

              <div className="border-t border-white/20 pt-4 mt-2">
                <Button variant="ghost" className="w-full text-white hover:bg-white/10 justify-start" asChild>
                  <Link href={`/dashboard/admin/organizations/${organization.id}/users`}>
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Usuários
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Events List */}
      <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all">
        <CardHeader className="pb-5 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-white text-xl">
              <Calendar className="w-6 h-6" />
              Eventos da Organização
            </CardTitle>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-yellow-400 transition-colors" />
                <form action="" method="GET" className="flex">
                  <Input
                    name="q"
                    defaultValue={searchParams.q || ''}
                    placeholder="Buscar eventos..."
                    className="pl-9 h-9 w-48 bg-white/5 border-white/10 text-white text-sm"
                  />
                </form>
              </div>

              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white" asChild>
                <Link href={`/dashboard/admin/organizations/${organization.id}/events/new`}>
                  <Plus className="w-4 h-4 mr-1" />
                  Novo
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-base text-white/90">
                {searchParams.q ? 'Nenhum evento encontrado para esta busca' : 'Nenhum evento cadastrado ainda'}
              </p>
              {searchParams.q && (
                <Button variant="link" className="text-yellow-400 mt-2" asChild>
                  <Link href={`/dashboard/admin/organizations/${organization.id}`}>
                    Limpar busca
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => {
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
