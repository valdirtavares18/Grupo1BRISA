import Link from 'next/link'
import { Button } from '@/components/atoms'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold text-white">
            Presença Eventos
          </h1>
          <p className="text-xl text-white/90">
            Sistema white-label para gestão de presença em eventos
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
