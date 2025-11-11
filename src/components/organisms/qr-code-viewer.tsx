'use client'

import { QRCodeSVG } from 'react-qr-code'
import { Card, CardContent, Button } from '@/components/atoms'
import { Download, QrCode } from 'lucide-react'
import { useRef } from 'react'

interface QRCodeViewerProps {
  url: string
  eventTitle: string
}

export function QRCodeViewer({ url, eventTitle }: QRCodeViewerProps) {
  const qrRef = useRef<HTMLDivElement>(null)

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
        className="p-6 lg:p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center"
      >
        <QRCodeSVG
          value={url}
          size={256}
          level="H"
          includeMargin
          className="max-w-full h-auto"
        />
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-semibold text-sm">{eventTitle}</p>
        <p className="text-xs text-muted-foreground break-all px-4">
          {url}
        </p>
      </div>
      
      <Button onClick={downloadQR} className="w-full" size="lg">
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