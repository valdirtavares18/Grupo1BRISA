import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { QrCode, Calendar, User, Lock, Search, Building2 } from 'lucide-react'
import Link from 'next/link'

export default async function UserDashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'END_USER') {
    redirect('/login')
  }

  return (
    <div className="p-4 lg:p-6 lg:py-8">
        <PageHeader title="Meus Eventos" description="Eventos que você participou" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/user/history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Minhas Presenças</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Visualize o histórico completo de eventos que você participou.
                </p>
                <div className="text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition">
                  Ver histórico →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/events/search">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Buscar Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Encontre eventos próximos a você por localização, tipo e data.
                </p>
                <div className="text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition">
                  Buscar eventos →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/user/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Complete seu perfil e gerencie suas informações pessoais.
                </p>
                <div className="text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition">
                  Editar perfil →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scan">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Escanear QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Escaneie o QR Code de um evento para registrar sua presença.
                </p>
                <div className="text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition">
                  Abrir scanner →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/user/password" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Altere sua senha e mantenha sua conta protegida.
                </p>
                <div className="text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition">
                  Alterar senha →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
    </div>
  )
}