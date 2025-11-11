import Link from 'next/link'
import { Button } from '@/components/atoms'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-7xl sm:text-8xl font-bold text-white">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Página não encontrada</h2>
          <p className="text-white/80">
            A página que você procura não existe ou foi removida.
          </p>
        </div>

        <Link href="/" className="inline-block">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white text-primary hover:bg-white/90 border-0 shadow-xl"
          >
            <Home className="mr-2 h-5 w-5" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    </div>
  )
}