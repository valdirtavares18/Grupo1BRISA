import { LoginForm } from '@/components/organisms/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
