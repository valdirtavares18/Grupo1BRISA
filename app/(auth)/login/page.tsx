import { LoginForm } from '@/components/organisms/login-form'
import { Logo } from '@/components/atoms'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <div className="container mx-auto px-4 py-4 lg:py-5">
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#C8CDD5] hover:text-white transition text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <Logo className="scale-110" />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}