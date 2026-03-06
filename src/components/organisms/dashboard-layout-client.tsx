'use client'

import { useState, createContext, useContext } from 'react'
import { Sidebar } from './sidebar'

interface SidebarContextType {
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: false,
  setIsExpanded: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userRole: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'END_USER'
  userName: string
  userPhotoUrl?: string
}

export function DashboardLayoutClient({
  children,
  userRole,
  userName,
  userPhotoUrl,
}: DashboardLayoutClientProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      <div className="flex min-h-screen bg-navy">
        <Sidebar userRole={userRole} userName={userName} userPhotoUrl={userPhotoUrl} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-x-hidden ${
            isExpanded ? 'lg:ml-80' : 'lg:ml-24'
          }`}
        >
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

