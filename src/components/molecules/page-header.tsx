import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">{title}</h1>
        {description && (
          <p className="text-white/90 text-base lg:text-lg">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
