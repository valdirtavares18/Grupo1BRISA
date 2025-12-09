'use client'

import { PublicSidebar } from './public-sidebar'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PublicSidebar />
      <main className="flex-1 transition-all duration-300 ease-in-out overflow-x-hidden lg:ml-20">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}

