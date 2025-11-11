import Link from 'next/link'
import { Button } from '@/components/atoms'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-xl text-white/90">Página não encontrada</p>
        <Link href="/">
          <Button variant="outline" className="bg-white text-primary hover:bg-white/90">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </div>
  )
}
