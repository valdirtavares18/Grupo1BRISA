'use client'

import Link from 'next/link'
import { MapPin, Check } from 'lucide-react'

interface LogoProps {
  variant?: 'full' | 'icon' | 'text'
  showText?: boolean
  className?: string
  href?: string
}

export function Logo({ variant = 'full', showText = true, className = '', href }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Circle */}
      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#001F3F] via-[#002244] to-[#001F3F] flex items-center justify-center flex-shrink-0 shadow-lg">
        {/* Location Pin with gradient effect */}
        <div className="absolute">
          <MapPin className="w-[22px] h-[22px] text-[#00D4FF]" style={{ 
            filter: 'drop-shadow(0 0 2px rgba(0, 212, 255, 0.6))',
            strokeWidth: 2.5
          }} />
        </div>
        {/* Checkmark overlay - rotated and positioned on top of pin */}
        <div className="absolute -top-0.5 -right-0.5 transform rotate-12">
          <Check className="w-3.5 h-3.5 text-[#00D4FF]" style={{ 
            filter: 'drop-shadow(0 1px 2px rgba(0, 212, 255, 0.8))',
            strokeWidth: 3
          }} />
        </div>
      </div>

      {/* Text */}
      {showText && variant !== 'icon' && (
        <div className="flex flex-col leading-tight">
          <span className="text-lg sm:text-xl font-bold uppercase tracking-tight" style={{
            background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FLUXO
          </span>
          <span className="text-lg sm:text-xl font-bold uppercase tracking-tight -mt-0.5" style={{
            background: 'linear-gradient(135deg, #00D4FF 0%, #00B8E6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            PRESENTE
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

