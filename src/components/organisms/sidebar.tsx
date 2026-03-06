'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebar } from './dashboard-layout-client'
import {
  LayoutDashboard,
  Building2,
  Plus,
  Calendar,
  MessageSquare,
  Users,
  User,
  History,
  Search,
  QrCode,
  Lock,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/atoms/avatar'

interface SidebarProps {
  userRole?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'END_USER'
  userName?: string
  userPhotoUrl?: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0]?.toUpperCase() || '?'
}

export function Sidebar({ userRole, userName, userPhotoUrl }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isExpanded, setIsExpanded } = useSidebar()
  const pathname = usePathname()

  // Mobile: fechar sidebar ao mudar de rota
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Detectar se está no mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      window.location.replace('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      window.location.replace('/login')
    }
  }

  // Definir itens de navegação baseado no role
  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
          { label: 'Nova Organização', href: '/dashboard/admin/organizations/new', icon: Plus },
          { label: 'Segurança', href: '/dashboard/admin/password', icon: Lock },
        ]

      case 'ORG_ADMIN':
        return [
          { label: 'Dashboard', href: '/dashboard/organization', icon: LayoutDashboard },
          { label: 'Novo Evento', href: '/dashboard/organization/events/new', icon: Plus },
          { label: 'Feed', href: '/dashboard/organization/feed', icon: MessageSquare },
          { label: 'Usuários', href: '/dashboard/organization/users', icon: Users },
          { label: 'Configurações', href: '/dashboard/organization/settings', icon: Settings },
        ]

      case 'END_USER':
        return [
          { label: 'Dashboard', href: '/dashboard/user', icon: LayoutDashboard },
          { label: 'Meu Histórico', href: '/dashboard/user/history', icon: History },
          { label: 'Buscar Eventos', href: '/events/search', icon: Search },
          { label: 'Escanear QR', href: '/scan', icon: QrCode },
          { label: 'Meu Perfil', href: '/dashboard/user/profile', icon: User },
        ]

      default:
        return []
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    if (href === '/dashboard/admin' || href === '/dashboard/organization' || href === '/dashboard/user') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Desktop: sidebar colapsada que expande no hover
  // Mobile: drawer que abre/fecha
  return (
    <>
      {/* Mobile: Botão para abrir sidebar */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition"
        aria-label="Abrir menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-80
          lg:w-24
          ${isExpanded ? 'lg:w-80' : ''}
          shadow-md lg:shadow-none
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
          {/* User Info */}
          {(userName || userRole) && (
            <div
              className={`border-b border-gray-200 transition-all duration-300 ${
                isMobileOpen || isExpanded
                  ? 'px-5 py-5'
                  : 'px-0 py-4 flex justify-center'
              }`}
            >
              {isMobileOpen || isExpanded ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {userPhotoUrl && <AvatarImage src={userPhotoUrl} alt={userName || ''} />}
                    <AvatarFallback className="bg-mustard/20 text-mustard font-semibold text-sm">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    {userName && (
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    )}
                    {userRole && (
                      <span className="text-xs text-slate-500 font-medium">
                        {userRole === 'SUPER_ADMIN'
                          ? 'Super Admin'
                          : userRole === 'ORG_ADMIN'
                            ? 'Admin'
                            : 'Usuário'}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <Avatar className="h-9 w-9">
                  {userPhotoUrl && <AvatarImage src={userPhotoUrl} alt={userName || ''} />}
                  <AvatarFallback className="bg-mustard/20 text-mustard font-semibold text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-5">
            <ul className="space-y-2 px-3">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-4 rounded-xl
                        transition-colors duration-200
                        ${(isMobileOpen || isExpanded) ? 'gap-4' : 'gap-0 justify-center'}
                        ${active
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      <Icon
                        className={`flex-shrink-0 w-7 h-7 ${active ? 'text-slate-900' : 'text-slate-500'
                          }`}
                      />
                      {(isMobileOpen || isExpanded) && (
                        <span className="font-semibold text-base whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={`
                            ml-auto px-3 py-1 rounded-full text-sm font-semibold
                            ${active
                              ? 'bg-slate-200 text-slate-900'
                              : 'bg-primary/10 text-primary'
                            }
                            ${isMobileOpen || isExpanded
                              ? 'opacity-100'
                              : 'opacity-0 w-0 overflow-hidden'
                            }
                          `}
                        >
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <ChevronRight
                          className={`
                            ml-auto w-5 h-5 text-slate-900
                            ${isMobileOpen || isExpanded
                              ? 'opacity-100'
                              : 'opacity-0 w-0 overflow-hidden'
                            }
                          `}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-5 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center px-4 py-4 rounded-xl
                text-red-600 hover:bg-red-50
                transition-all duration-200 font-semibold
                ${(isMobileOpen || isExpanded) ? 'gap-4' : 'gap-0 justify-center'}
              `}
            >
              <LogOut className="flex-shrink-0 w-7 h-7" />
              <span
                className={`
                  text-base whitespace-nowrap
                  transition-all duration-200
                  ${isMobileOpen || isExpanded
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4 w-0 overflow-hidden'
                  }
                `}
              >
                Sair
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

