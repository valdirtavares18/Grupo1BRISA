import { LoginForm } from '@/components/organisms/login-form'
import { Logo } from '@/components/atoms'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary to-primary/80">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <Logo className="scale-150" />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}