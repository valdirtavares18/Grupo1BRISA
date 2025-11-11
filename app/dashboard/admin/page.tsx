import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { organizationService } from '@/services/organization.service'
import Link from 'next/link'
import { Building2, Plus, Calendar, Users, TrendingUp, Eye } from 'lucide-react'

export default async function AdminDashboardPage() {
  const organizations = await organizationService.getAllOrganizations()

  const totalEvents = organizations.reduce((sum, org) => sum + (org._count?.events || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar userRole="SUPER ADMIN" userName="Administrador" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <PageHeader
          title="Dashboard Administrador"
          description="Gerencie todas as organizações da plataforma"
          action={
            <Link href="/dashboard/admin/organizations/new">
              <div className="bg-primary text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-primary/90 transition shadow-lg hover:shadow-xl flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nova Organização</span>
                <span className="sm:hidden">Nova</span>
              </div>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organizações</p>
                  <p className="text-3xl font-bold text-primary mt-2">{organizations.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{totalEvents}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organizações Ativas</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {organizations.filter(o => o.isActive).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuários Admin</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {organizations.reduce((sum, org) => sum + (org._count?.platformUsers || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organizações
          </h2>
          
          {organizations.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma organização cadastrada</h3>
                <p className="text-muted-foreground mb-6">
                  Comece criando sua primeira organização
                </p>
                <Link href="/dashboard/admin/organizations/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Organização
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {organizations.map((org) => (
                <Card key={org.id} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition">
                          {org.name}
                        </CardTitle>
                        <code className="text-xs text-muted-foreground mt-1 block">
                          {org.slug}
                        </code>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${org.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Eventos
                      </span>
                      <span className="font-semibold">{org._count?.events || 0}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Usuários
                      </span>
                      <span className="font-semibold">{org._count?.platformUsers || 0}</span>
                    </div>

                    <Link
                      href={`/dashboard/admin/organizations/${org.id}`}
                      className="flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-semibold pt-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}