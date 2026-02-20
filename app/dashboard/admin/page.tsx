import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms'
import { organizationService } from '@/services/organization.service'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, Calendar, Users, TrendingUp, Eye, CheckCircle, XCircle, Globe } from 'lucide-react'
import { AdminSearchBar } from '@/components/organisms/admin-search-bar'

interface PageProps {
  searchParams: {
    q?: string
    status?: string
  }
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  let organizations = await organizationService.getAllOrganizations()

  // Aplicar filtros
  const query = searchParams.q?.toLowerCase()
  const status = searchParams.status

  if (query || status) {
    organizations = organizations.filter((org: any) => {
      const matchesQuery = !query ||
        org.name.toLowerCase().includes(query) ||
        org.slug.toLowerCase().includes(query)

      const matchesStatus = !status || status === 'all' ||
        (status === 'active' && org.isActive) ||
        (status === 'inactive' && !org.isActive)

      return matchesQuery && matchesStatus
    })
  }

  const totalEvents = organizations.reduce((sum: number, org: any) => sum + (org._count?.events || 0), 0)

  return (
    <div className="p-5 lg:p-6 lg:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white">Dashboard Administrador</h1>
          <p className="text-base text-white/90">Gerencie todas as organizações da plataforma</p>
        </div>
        <Link href="/dashboard/admin/organizations/new" className="inline-flex">
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-xl shadow-orange-500/30 flex items-center gap-2 text-base px-6 py-3 h-auto">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Organização</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <AdminSearchBar placeholder="Buscar organizações por nome ou slug..." />


      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-1.5">Organizações</p>
                <p className="text-4xl font-bold text-white">{organizations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-1.5">Total de Eventos</p>
                <p className="text-4xl font-bold text-white">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-1.5">Organizações Ativas</p>
                <p className="text-4xl font-bold text-white">
                  {organizations.filter((o: any) => o.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-1.5">Usuários Admin</p>
                <p className="text-4xl font-bold text-white">
                  {organizations.reduce((sum: number, org: any) => sum + (org._count?.platformUsers || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white/10 border-white/20 hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Distribuição de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {organizations.slice(0, 5).map((org: any) => {
                const count = org._count?.events || 0
                const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0
                return (
                  <div key={org.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-medium">{org.name}</span>
                      <span className="text-white/60">{count} eventos</span>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {organizations.length === 0 && (
                <div className="text-center py-10 text-white/40 italic">
                  Nenhum dado disponível para exibição
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Resumo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-white/70">Média Eventos/Org</span>
                <span className="text-xl font-bold text-white">
                  {organizations.length > 0 ? (totalEvents / organizations.length).toFixed(1) : 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-white/70">Taxa de Ativação</span>
                <span className="text-xl font-bold text-emerald-400">
                  {organizations.length > 0
                    ? Math.round((organizations.filter((o: any) => o.isActive).length / organizations.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="p-8 text-center">
                <div className="inline-block p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-3">
                  <Globe className="w-10 h-10 text-yellow-400 animate-pulse" />
                </div>
                <p className="text-sm text-white/50">Sistema em conformidade e monitorado em tempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            Organizações
          </h2>
          <p className="text-lg text-white/70 hidden sm:block">
            {organizations.length} {organizations.length === 1 ? 'organização' : 'organizações'}
          </p>
        </div>

        {organizations.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-20 text-center">
              <div className="w-24 h-24 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-8">
                <Building2 className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Nenhuma organização cadastrada</h3>
              <p className="text-xl text-white/80 mb-10">
                Comece criando sua primeira organização
              </p>
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-xl shadow-orange-500/30 px-8 py-7 h-auto text-lg" asChild>
                <Link href="/dashboard/admin/organizations/new">
                  <Plus className="w-6 h-6 mr-2" />
                  Nova Organização
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {organizations.map((org: any) => (
              <Card key={org.id} className="bg-white/10 border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all group">
                <CardHeader className="pb-5 pt-7">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {org.isActive ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${org.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {org.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-bold mb-3 text-white line-clamp-2 group-hover:text-yellow-300 transition-colors">
                        {org.name}
                      </CardTitle>
                      <code className="text-sm text-white/70 font-mono bg-white/15 px-3 py-1.5 rounded-lg inline-block border border-white/25">
                        {org.slug}
                      </code>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pb-7">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors">
                    <span className="flex items-center gap-3 text-base font-medium text-white/90">
                      <Calendar className="w-6 h-6 text-white/70" />
                      Eventos
                    </span>
                    <span className="text-2xl font-bold text-white">{org._count?.events || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors">
                    <span className="flex items-center gap-3 text-base font-medium text-white/90">
                      <Users className="w-6 h-6 text-white/70" />
                      Usuários Admin
                    </span>
                    <span className="text-2xl font-bold text-white">{org._count?.platformUsers || 0}</span>
                  </div>

                  <Link
                    href={`/dashboard/admin/organizations/${org.id}`}
                    className="flex items-center justify-center gap-3 w-full py-4 px-5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 transition-all font-semibold text-lg shadow-lg shadow-orange-500/30 mt-6"
                  >
                    <Eye className="w-5 h-5" />
                    Ver Detalhes
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}