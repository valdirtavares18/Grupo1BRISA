import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { QrCode, Calendar, User, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar userRole="USUÁRIO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <PageHeader title="Meus Eventos" description="Eventos que você participou" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/user/history">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Minhas Presenças</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Visualize o histórico completo de eventos que você participou.
                </p>
                <div className="text-sm text-primary font-semibold">
                  Ver histórico →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/user/profile">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Complete seu perfil e gerencie suas informações pessoais.
                </p>
                <div className="text-sm text-purple-600 font-semibold">
                  Editar perfil →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/user/password" className="block">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Altere sua senha e mantenha sua conta protegida.
                </p>
                <div className="text-sm text-orange-600 font-semibold">
                  Alterar senha →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}