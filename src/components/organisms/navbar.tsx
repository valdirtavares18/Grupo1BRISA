'use client'

import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button, Logo } from '@/components/atoms'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  userRole?: string
  userName?: string
}

export function Navbar({ userRole, userName }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo href="/dashboard" />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {userName && (
              <span className="text-sm text-muted-foreground">
                {userName}
              </span>
            )}
            {userRole && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {userRole}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-3">
              {userName && (
                <p className="text-sm text-muted-foreground px-3">{userName}</p>
              )}
              {userRole && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold ml-3">
                  {userRole}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
