import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../src/lib/variables.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FLUXO PRESENTE - Sistema de Gestão de Presença',
  description: 'Plataforma white-label completa para captação de dados de público com conformidade LGPD e relatórios em tempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
