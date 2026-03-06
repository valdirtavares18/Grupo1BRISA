'use client'

import { PublicSidebar } from './public-sidebar'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-navy">
      <PublicSidebar />
      <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

