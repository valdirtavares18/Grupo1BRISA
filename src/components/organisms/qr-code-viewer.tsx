'use client'

import { QRCodeSVG } from 'react-qr-code'
import { Card, CardContent, Button } from '@/components/atoms'
import { Download } from 'lucide-react'
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

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-code-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div ref={qrRef} className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={url}
              size={256}
              level="H"
              includeMargin
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {eventTitle}
            </p>
            <p className="text-xs text-muted-foreground break-all max-w-xs">
              {url}
            </p>
          </div>
          <Button onClick={downloadQR} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Baixar QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
