'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Search,
  User,
  LogIn,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { Logo } from '@/components/atoms'

export function PublicSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Buscar Eventos', href: '/events/search', icon: Search },
  ]

  if (isLoggedIn) {
    navItems.push(
      { label: 'Dashboard', href: '/dashboard', icon: User }
    )
  } else {
    navItems.push(
      { label: 'Entrar', href: '/login', icon: LogIn }
    )
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition text-white"
        aria-label="Abrir menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          bg-gradient-to-b from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-md border-r border-white/10
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72
          lg:w-20
          ${isExpanded ? 'lg:w-72' : ''}
          shadow-2xl lg:shadow-none
          flex-shrink-0
        `}
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) {
            setIsExpanded(true)
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 1024) {
            setIsExpanded(false)
          }
        }}
      >
        <div className="flex flex-col h-full">
          <div className={`p-6 border-b border-white/10 transition-all duration-300 ${
            isMobileOpen || isExpanded 
              ? 'opacity-100' 
              : 'opacity-0 h-0 p-0 overflow-hidden'
          }`}>
            <Logo className="scale-110" />
          </div>

          <div className={`p-4 border-b border-white/10 transition-all duration-300 ${
            isMobileOpen || isExpanded 
              ? 'opacity-100' 
              : 'opacity-0 h-0 p-0 overflow-hidden'
          }`}>
            <button
              onClick={handleBack}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-3">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${(isMobileOpen || isExpanded) ? 'gap-4' : 'gap-0 justify-center'}
                        ${
                          active
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20 text-yellow-300 border border-orange-400/30 shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <Icon
                        className={`flex-shrink-0 w-5 h-5 ${
                          active ? 'text-yellow-300' : 'text-white/60'
                        }`}
                      />
                      {(isMobileOpen || isExpanded) && (
                        <span className="font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                      {active && (isMobileOpen || isExpanded) && (
                        <ChevronRight
                          className="ml-auto w-4 h-4 text-yellow-300"
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

