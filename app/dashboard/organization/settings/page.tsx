'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/molecules'
import { Lock, ChevronRight } from 'lucide-react'

const settingsSections = [
  {
    label: 'Segurança',
    description: 'Altere sua senha e gerencie a segurança da sua conta.',
    href: '/dashboard/organization/settings/security',
    icon: Lock,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-8">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua conta e da organização."
      />

      <div className="grid gap-4 max-w-2xl">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-4 p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                <Icon className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900">{section.label}</p>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
