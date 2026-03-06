import { RegisterForm } from '@/components/organisms/register-form'
import { Logo } from '@/components/atoms'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#C8CDD5] hover:text-white transition text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <Logo className="scale-150" />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}