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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/user/history">
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full group">
            <CardHeader>
              <Calendar className="w-8 h-8 text-blue-600 mb-4" />
              <CardTitle className="text-slate-900 text-xl font-bold">Meu Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                Visualize o histórico completo de eventos que você participou.
              </p>
              <div className="text-sm text-mustard font-semibold group-hover:text-mustard transition-colors">
                Ver histórico →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/events/search">
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full group">
            <CardHeader>
              <Search className="w-8 h-8 text-blue-600 mb-4" />
              <CardTitle className="text-slate-900 text-xl font-bold">Buscar Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                Encontre eventos próximos a você por localização, tipo e data.
              </p>
              <div className="text-sm text-mustard font-semibold group-hover:text-mustard transition-colors">
                Buscar eventos →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/user/profile">
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full group">
            <CardHeader>
              <User className="w-8 h-8 text-blue-600 mb-4" />
              <CardTitle className="text-slate-900 text-xl font-bold">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                Complete seu perfil e gerencie suas informações pessoais.
              </p>
              <div className="text-sm text-mustard font-semibold group-hover:text-mustard transition-colors">
                Editar perfil →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/scan">
          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full group">
            <CardHeader>
              <QrCode className="w-8 h-8 text-blue-600 mb-4" />
              <CardTitle className="text-slate-900 text-xl font-bold">Escanear QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                Escaneie o QR Code de um evento para registrar sua presença.
              </p>
              <div className="text-sm text-mustard font-semibold group-hover:text-mustard transition-colors">
                Abrir scanner →
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>
    </div>
  )
}