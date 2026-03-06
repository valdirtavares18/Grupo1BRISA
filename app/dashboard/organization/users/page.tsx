import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarImage, AvatarFallback } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { endUserService } from '@/services/end-user.service'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Users, User, Mail, Phone, Calendar, TrendingUp, UserCheck } from 'lucide-react'
import { formatCPF } from '@/lib/utils'

export default async function OrganizationUsersPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'ORG_ADMIN' || !payload.organizationId) {
    redirect('/login')
  }

  const [endUsers, stats] = await Promise.all([
    endUserService.getEndUsersByOrganization(payload.organizationId),
    endUserService.getEndUserStatsByOrganization(payload.organizationId),
  ])

  return (
    <div className="p-4 lg:p-6 lg:py-8">
        <PageHeader
          title="Usuários Finais"
          description="Visualize todos os participantes que registraram presença nos seus eventos"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
          <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Total</p>
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Com Nome</p>
                  <UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-[#C8CDD5]" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white">{stats.withName}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Com Email</p>
                  <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-mustard" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-mustard">{stats.withEmail}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Com Telefone</p>
                  <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-mustard" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-mustard">{stats.withPhone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              Lista de Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {endUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[#8B92A0] mx-auto mb-4 opacity-50" />
                <p className="text-[#C8CDD5]">
                  Nenhum usuário final registrou presença ainda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {endUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl border-2 border-navy-border hover:border-navy-border hover:bg-navy-light transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar e Info Principal */}
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-12 h-12">
                          {user.profilePhotoUrl && (
                            <AvatarImage src={user.profilePhotoUrl} alt={user.fullName || 'Usuário'} />
                          )}
                          <AvatarFallback>
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-base text-white">
                              {user.fullName || 'Sem nome cadastrado'}
                            </p>
                            {!user.fullName && (
                              <Badge variant="secondary" className="text-xs bg-navy-light text-white border-navy-border">
                                Sem nome
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[#C8CDD5]">
                            <span className="font-mono">CPF: {formatCPF(user.cpf)}</span>
                            
                            {user.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                            )}
                            
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-mustard" />
                          <span className="text-sm font-semibold text-white">
                            {user.totalPresences} {user.totalPresences === 1 ? 'presença' : 'presenças'}
                          </span>
                        </div>
                        
                        {user.lastPresence && (
                          <div className="flex items-center gap-1 text-xs text-[#8B92A0]">
                            <Calendar className="w-3 h-3" />
                            Última: {new Date(user.lastPresence).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}

