'use client'

import { QRScanner } from '@/components/organisms/qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { Logo } from '@/components/atoms'
import { useRouter } from 'next/navigation'
import { QrCode, Scan } from 'lucide-react'

export default function ScanPage() {
  const router = useRouter()

  const handleScanSuccess = (decodedText: string) => {
    try {
      // Extrair token da URL do QR code
      // Formato esperado: /event/[token] ou https://dominio.com/event/[token]
      const url = new URL(decodedText)
      const pathname = url.pathname
      const token = pathname.split('/event/')[1]

      if (token) {
        router.push(`/event/${token}`)
      } else {
        throw new Error('Token não encontrado na URL')
      }
    } catch (error: any) {
      // Se não for URL válida, tentar extrair token diretamente
      const match = decodedText.match(/\/event\/([a-zA-Z0-9-]+)/)
      if (match && match[1]) {
        router.push(`/event/${match[1]}`)
      } else {
        // Tratar como token direto
        router.push(`/event/${decodedText}`)
      }
    }
  }

  const handleScanError = (error: string) => {
    console.error('Erro no scanner:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-800 to-primary p-4">
      <div className="max-w-2xl mx-auto py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Escanear QR Code
          </h1>
          <p className="text-white/80 text-base">
            Aponte a câmera para o QR code do evento
          </p>
        </div>

        {/* Scanner Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Scanner de QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onError={handleScanError}
              fps={10}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 border-0 shadow-lg bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Como usar</p>
                  <p className="text-sm text-muted-foreground">
                    1. Clique em &quot;Iniciar Scanner&quot;<br />
                    2. Permita o acesso à câmera<br />
                    3. Aponte para o QR code do evento<br />
                    4. Aguarde a leitura automática
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

