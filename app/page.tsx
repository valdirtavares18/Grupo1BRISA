import Link from 'next/link'
import { Button, Logo } from '@/components/atoms'
import { PublicLayout } from '@/components/organisms/public-layout'
import { 
  ArrowRight, 
  QrCode, 
  Users, 
  Shield, 
  TrendingUp, 
  Smartphone,
  MapPin,
  Clock,
  BarChart3,
  Lock,
  Zap,
  Globe
} from 'lucide-react'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-8 lg:py-10">
        <div className="flex items-center justify-end gap-5">
          <Button variant="ghost" className="text-lg text-white/90 hover:text-white hover:bg-white/10 px-6 py-3" asChild>
              <Link href="/login">
                Entrar
              </Link>
            </Button>
          <Button className="bg-white text-blue-900 hover:bg-white/90 text-lg px-6 py-3" asChild>
              <Link href="/register">
                Começar Agora
              </Link>
            </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block px-6 py-3 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 text-base font-medium mb-6">
            ✨ Sistema White-Label Completo
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight">
            Gestão de Presença
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent mt-3">
              ToAKi
            </span>
          </h1>
          
          <p className="text-2xl sm:text-3xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Plataforma completa para registro de presença em eventos com QR Code, 
            gestão de público, relatórios em tempo real e total conformidade LGPD.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-xl shadow-yellow-500/50 text-xl px-10 py-7" asChild>
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center">
                Acessar Sistema
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-transparent !text-white hover:bg-white/10 hover:!text-white text-xl px-10 py-7" asChild>
              <Link href="/events/search" className="w-full sm:w-auto flex items-center justify-center">
                Buscar Eventos
                <MapPin className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-28 lg:py-40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Recursos Poderosos
            </h2>
            <p className="text-2xl sm:text-2xl text-white/50 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar eventos e captar dados de público
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: QrCode,
                title: 'QR Code Único',
                desc: 'Cada evento possui um QR Code exclusivo para registro instantâneo via câmera do celular'
              },
              {
                icon: Users,
                title: 'Gestão de Público',
                desc: 'Dashboards completos com métricas, rastreabilidade e análises de participantes'
              },
              {
                icon: Shield,
                title: 'Conformidade LGPD',
                desc: 'Sistema completo de consentimentos, privacidade e gestão de dados pessoais'
              },
              {
                icon: BarChart3,
                title: 'Relatórios em Tempo Real',
                desc: 'Acompanhe presenças, estatísticas e exporte dados para análise'
              },
              {
                icon: MapPin,
                title: 'Busca por Localização',
                desc: 'Encontre eventos próximos por cidade, estado, CEP ou proximidade geográfica'
              },
              {
                icon: Globe,
                title: 'White-Label',
                desc: 'Personalize cores, logos e domínios para cada organização cliente'
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative p-10 lg:p-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/30 hover:from-white/10 hover:to-white/5 transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  </div>
                  <p className="text-white/50 text-lg leading-relaxed flex-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="p-12 lg:p-16 rounded-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 shadow-2xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Pronto para começar?
            </h2>
            <p className="text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Cadastre sua organização e comece a gerenciar eventos com ToAKi hoje mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 shadow-xl text-xl px-10 py-6 h-auto" asChild>
                <Link href="/register" className="flex items-center justify-center">
                  Criar Conta Grátis
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white shadow-xl text-xl px-10 py-6 h-auto" asChild>
                <Link href="/login" className="flex items-center justify-center">
                Já tenho uma conta
              </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <Logo showText={true} className="opacity-80 scale-110" />
              <span className="text-white/60 text-base">
                © 2025 ToAKi. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex gap-8 text-base">
              <Link href="/events/search" className="text-white/60 hover:text-white transition-colors">
                Buscar Eventos
              </Link>
              <Link href="/login" className="text-white/60 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-white/60 hover:text-white transition-colors">
                Cadastro
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </PublicLayout>
  )
}