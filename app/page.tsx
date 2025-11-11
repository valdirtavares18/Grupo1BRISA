import Link from 'next/link'
import { Button } from '@/components/atoms'
import { ArrowRight, QrCode, Users, Shield, TrendingUp, Check } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#001F3F]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
              <Shield className="w-4 h-4" />
              <span>Conforme LGPD</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Gestão de Presença
              <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                em Eventos
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Plataforma white-label completa para captação de dados de público
              com conformidade LGPD e relatórios em tempo real
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl">
                  Acessar Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-16">
            <div className="group p-6 lg:p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">QR Code Único</h3>
              <p className="text-white/80">
                Cada evento possui um QR Code exclusivo para registro instantâneo de presença
              </p>
            </div>

            <div className="group p-6 lg:p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gestão de Público</h3>
              <p className="text-white/80">
                Dashboards completos com métricas e rastreabilidade de participantes
              </p>
            </div>

            <div className="group p-6 lg:p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">White Label</h3>
              <p className="text-white/80">
                Personalize cores, logos e domínios para cada organização cliente
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 p-6 lg:p-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
              Por que escolher nossa plataforma?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {[
                'Conformidade total com a LGPD',
                'Registro de presença em tempo real',
                'Relatórios detalhados e exportáveis',
                'Interface intuitiva e moderna',
                'Suporte a múltiplas organizações',
                'Customização completa por cliente',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-white/60 text-sm">
            © 2025 Presença Eventos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}