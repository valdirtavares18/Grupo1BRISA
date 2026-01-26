'use client'

import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  variant?: 'full' | 'icon' | 'text'
  showText?: boolean
  className?: string
  href?: string
}

export function Logo({ variant = 'full', showText = true, className = '', href }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0 w-[220px] h-[110px]">
        <Image
          src="/logo.png"
          alt="ToAKi - APONTOU? REGISTROU!"
          fill
          className="object-contain"
          priority
          sizes="220px"
        />
      </div>
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

