import Link from 'next/link'
import Image from 'next/image'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Button, Logo } from '@/components/atoms'
import { PublicLayout } from '@/components/organisms/public-layout'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })
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
      <div className={jakarta.className}>
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 lg:py-5">
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" className="text-base text-white hover:text-white hover:bg-navy-light px-4 py-2" asChild>
              <Link href="/login">
                Entrar
              </Link>
            </Button>
          <Button className="bg-mustard text-ink hover:bg-mustard-dark text-base px-5 py-2.5" asChild>
              <Link href="/register">
                Começar Agora
              </Link>
            </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Onde o evento acontece,
              {' '}a <span className="text-mustard">ToAKi</span> registra
            </h1>
            
            <p className="text-lg sm:text-xl text-[#C8CDD5] max-w-xl leading-relaxed">
              Plataforma completa para registro de presença em eventos com QR Code, 
              gestão de público, relatórios em tempo real e total conformidade LGPD.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-3">
              <Button size="lg" className="w-full sm:w-auto bg-mustard text-ink hover:bg-mustard-dark shadow-md text-base px-6 py-3" asChild>
                <Link href="/login" className="w-full sm:w-auto flex items-center justify-center">
                  Acessar Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border border-navy-border bg-transparent !text-white hover:bg-navy-light hover:!text-white text-base px-6 py-3" asChild>
                <Link href="/events/search" className="w-full sm:w-auto flex items-center justify-center">
                  Buscar Eventos
                  <MapPin className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Large Logo */}
          <div className="flex-1 flex items-center justify-center lg:justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px]">
              <Image
                src="/logo.png"
                alt="ToAKi - APONTOU? REGISTROU!"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(235,192,63,0.15)]"
                priority
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 360px, 440px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-14 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3">
              Recursos Poderosos
            </h2>
            <p className="text-base text-[#8B92A0] max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar eventos e captar dados de público
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                className="relative rounded-2xl p-7 lg:p-8 bg-navy-light border border-navy-border"
              >
                <span className="absolute top-5 right-6 text-2xl font-bold text-mustard/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col h-full">
                  <feature.icon className="w-8 h-8 text-mustard mb-5" />
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-[#8B92A0] text-sm leading-relaxed flex-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-10 lg:py-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className="p-8 lg:p-10 rounded-3xl bg-navy-light border border-navy-border">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-base text-[#C8CDD5] mb-6 max-w-3xl mx-auto">
              Cadastre sua organização e comece a gerenciar eventos com ToAKi hoje mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button size="lg" className="bg-mustard text-ink hover:bg-mustard-dark shadow-md text-base px-6 py-3 h-auto" asChild>
                <Link href="/register" className="flex items-center justify-center">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border border-navy-border bg-transparent text-white hover:bg-navy-light hover:text-white text-base px-6 py-3 h-auto" asChild>
                <Link href="/login" className="flex items-center justify-center">
                Já tenho uma conta
              </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <Logo showText={true} className="opacity-90" />
              <span className="text-[#8B92A0] text-base">
                © 2025 ToAKi. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex gap-8 text-base">
              <Link href="/events/search" className="text-[#8B92A0] hover:text-white transition-colors">
                Buscar Eventos
              </Link>
              <Link href="/login" className="text-[#8B92A0] hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-[#8B92A0] hover:text-white transition-colors">
                Cadastro
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </PublicLayout>
  )
}