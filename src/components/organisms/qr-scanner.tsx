'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { AlertCircle, Camera, X } from 'lucide-react'
import { Button } from '@/components/atoms'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
  fps?: number
}

export function QRScanner({ onScanSuccess, onError, fps = 10 }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  const startScanning = async () => {
    try {
      setError('')

      if (!scannerContainerRef.current) {
        return
      }

      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      // Configurações para melhor detecção em mobile
      const config = {
        fps,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: 'environment', // Usar câmera traseira
        },
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Sucesso na leitura
          onScanSuccess(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignorar erros de detecção (são normais durante a busca)
        }
      )

      setIsScanning(true)
      setHasPermission(true)
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err)
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permissão para usar a câmera foi negada. Por favor, permita o acesso à câmera nas configurações do navegador.')
        setHasPermission(false)
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Nenhuma câmera encontrada. Verifique se seu dispositivo possui uma câmera.')
        setHasPermission(false)
      } else {
        setError(err.message || 'Erro ao acessar a câmera')
        setHasPermission(false)
      }
      
      onError?.(err.message || 'Erro ao acessar a câmera')
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
        scannerRef.current = null
      }
      setIsScanning(false)
    } catch (err) {
      console.error('Erro ao parar scanner:', err)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="w-full space-y-4">
      <div
        id="qr-reader"
        ref={scannerContainerRef}
        className={`w-full rounded-xl overflow-hidden ${
          isScanning ? 'min-h-[300px]' : 'min-h-[200px] bg-gray-100'
        }`}
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Erro</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {hasPermission === false && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">Permissão necessária</p>
            <p className="text-sm text-blue-700 mt-1">
              Para escanear QR codes, é necessário permitir o acesso à câmera. 
              Por favor, verifique as configurações do navegador e tente novamente.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="w-full"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Iniciar Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <X className="w-5 h-5 mr-2" />
            Parar Scanner
          </Button>
        )}
      </div>

      {!isScanning && !error && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Clique em "Iniciar Scanner" para começar a ler QR codes
          </p>
        </div>
      )}
    </div>
  )
}

