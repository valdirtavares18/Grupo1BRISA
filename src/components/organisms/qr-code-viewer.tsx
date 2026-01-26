'use client'

import { Card, CardContent, Button } from '@/components/atoms'
import { Download } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

interface QRCodeViewerProps {
  url: string
  eventTitle: string
}

export function QRCodeViewer({ url, eventTitle }: QRCodeViewerProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [QRCodeSVG, setQRCodeSVG] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validar URL antes de gerar QRCode
    if (!url || url.trim() === '') {
      setError('URL do QR Code não está disponível')
      setLoading(false)
      return
    }

    import('react-qr-code').then((mod: any) => {
      // react-qr-code exporta QRCodeSVG como named export
      const QRCodeComponent = mod.QRCodeSVG || mod.default
      if (QRCodeComponent) {
        setQRCodeSVG(() => QRCodeComponent)
        setLoading(false)
      } else {
        console.error('Módulo react-qr-code não contém QRCodeSVG:', mod)
        setError('Erro ao carregar gerador de QR Code')
        setLoading(false)
      }
    }).catch((err) => {
      console.error('Erro ao carregar react-qr-code:', err)
      setError('Erro ao carregar gerador de QR Code')
      setLoading(false)
    })
  }, [url])

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 1024
    canvas.height = 1024

    img.onload = () => {
      if (!ctx) return
      
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const padding = 100
      ctx.drawImage(img, padding, padding, canvas.width - padding * 2, canvas.height - padding * 2)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-code-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="space-y-4">
      <div 
        ref={qrRef} 
        className="p-6 lg:p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[256px]"
      >
        {loading ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Carregando QR Code...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">URL: {url || 'Não disponível'}</p>
          </div>
        ) : QRCodeSVG && url ? (
          <QRCodeSVG
            value={url}
            size={256}
            level="H"
            includeMargin
            className="max-w-full h-auto"
          />
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">URL não disponível</p>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-semibold text-sm">{eventTitle}</p>
        <p className="text-xs text-muted-foreground break-all px-4">
          {url}
        </p>
      </div>
      
      <Button onClick={downloadQR} className="w-full" size="lg" disabled={loading || !QRCodeSVG}>
        <Download className="mr-2 h-5 w-5" />
        Baixar QR Code (PNG)
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-muted-foreground">Tamanho</p>
          <p className="font-semibold text-sm">1024x1024px</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-muted-foreground">Formato</p>
          <p className="font-semibold text-sm">PNG</p>
        </div>
      </div>
    </div>
  )
}
