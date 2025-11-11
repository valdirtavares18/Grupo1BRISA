import { RegisterForm } from '@/components/organisms/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}
