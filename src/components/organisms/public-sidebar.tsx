'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Search,
  User,
  LogIn,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { Logo } from '@/components/atoms'

export function PublicSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()

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

  // Se estiver em /[slug]/events ou /[slug]/feed, adicionar link para página da organização
  const pathSegments = pathname.split('/').filter(Boolean)
  const slug = pathSegments[0]
  const isOrgSubpage = slug && pathSegments.length > 1 && ['events', 'feed'].includes(pathSegments[1])

  const navItems = [
    ...(isOrgSubpage ? [{ label: 'Página Principal', href: `/${slug}`, icon: Home }] : []),
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

  const renderNavContent = (expanded: boolean, onLinkClick?: () => void) => (
    <div className="flex flex-col h-full bg-navy">
      <div className={`p-6 border-b border-navy-border transition-all duration-300 ${
        expanded ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'
      }`}>
        <Logo className="scale-110" />
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
                  onClick={onLinkClick}
                  className={`
                    flex items-center px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${expanded ? 'gap-4' : 'gap-0 justify-center'}
                    ${
                      active
                        ? 'bg-mustard/10 text-mustard border border-mustard/20'
                        : 'text-[#8B92A0] hover:bg-navy-light hover:text-white border border-transparent'
                    }
                  `}
                >
                  <Icon className={`flex-shrink-0 w-5 h-5 ${active ? 'text-mustard' : 'text-[#8B92A0]'}`} />
                  {expanded && (
                    <>
                      <span className="font-medium whitespace-nowrap">{item.label}</span>
                      {active && <ChevronRight className="ml-auto w-4 h-4 text-mustard" />}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  const mobileDrawer = isMobileOpen && typeof document !== 'undefined' && createPortal(
    <div className="lg:hidden fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setIsMobileOpen(false)}
        aria-hidden
      />
      <aside className="absolute top-0 left-0 h-full w-72 bg-navy border-r border-navy-border shadow-xl transition-transform duration-300">
        {renderNavContent(true, () => setIsMobileOpen(false))}
      </aside>
      <button
        onClick={() => setIsMobileOpen(false)}
        className="absolute top-4 left-4 z-10 p-3 rounded-xl bg-navy-light border border-navy-border shadow-md hover:bg-navy-border transition text-white"
        aria-label="Fechar menu"
      >
        <X className="w-6 h-6" />
      </button>
    </div>,
    document.body
  )

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-navy-light border border-navy-border shadow-md hover:bg-navy-border transition text-white"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {mobileDrawer}

      {/* Sidebar desktop */}
      <aside
        className={`
          hidden lg:flex lg:sticky top-0 left-0 h-screen z-40
          transition-all duration-300 ease-in-out
          w-20
          ${isExpanded ? 'lg:w-72' : ''}
          flex-shrink-0 flex-col
          bg-navy border-r border-navy-border
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {renderNavContent(isExpanded)}
      </aside>
    </>
  )
}

