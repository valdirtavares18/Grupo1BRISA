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
      <nav className="container mx-auto px-4 py-4 lg:py-5">
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" className="text-base text-white/90 hover:text-white hover:bg-white/10 px-4 py-2" asChild>
              <Link href="/login">
                Entrar
              </Link>
            </Button>
          <Button className="bg-white text-blue-900 hover:bg-white/90 text-base px-5 py-2.5" asChild>
              <Link href="/register">
                Começar Agora
              </Link>
            </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 text-sm font-medium mb-2">
            ✨ Sistema White-Label Completo
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Gestão de Presença
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent mt-2">
              ToAKi
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Plataforma completa para registro de presença em eventos com QR Code, 
            gestão de público, relatórios em tempo real e total conformidade LGPD.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-5">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-xl shadow-yellow-500/50 text-base px-6 py-3" asChild>
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center">
                Acessar Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-transparent !text-white hover:bg-white/10 hover:!text-white text-base px-6 py-3" asChild>
              <Link href="/events/search" className="w-full sm:w-auto flex items-center justify-center">
                Buscar Eventos
                <MapPin className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-14 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Recursos Poderosos
            </h2>
            <p className="text-base text-white/50 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar eventos e captar dados de público
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
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
                className="group relative p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/30 hover:from-white/10 hover:to-white/5 transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed flex-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-10 lg:py-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className="p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-base text-white/90 mb-6 max-w-3xl mx-auto">
              Cadastre sua organização e comece a gerenciar eventos com ToAKi hoje mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 shadow-xl text-base px-6 py-3 h-auto" asChild>
                <Link href="/register" className="flex items-center justify-center">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white shadow-xl text-base px-6 py-3 h-auto" asChild>
                <Link href="/login" className="flex items-center justify-center">
                Já tenho uma conta
              </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 py-8">
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