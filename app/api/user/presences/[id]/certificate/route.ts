import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db-sqlite'
import jsPDF from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'END_USER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar presença
    const presenceResult = await query(
      `SELECT 
        pl.*,
        e.title as eventTitle,
        e."startDate",
        e."endDate",
        o.name as organizationName,
        eu."fullName" as userName,
        eu.cpf
      FROM presence_logs pl
      JOIN "Event" e ON pl."eventId" = e.id
      JOIN "Organization" o ON e."organizationId" = o.id
      LEFT JOIN end_users eu ON pl."endUserId" = eu.id
      WHERE pl.id = ? AND pl."endUserId" = ?`,
      [params.id, payload.userId]
    )

    if (presenceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Presença não encontrada' },
        { status: 404 }
      )
    }

    const presence = presenceResult.rows[0]

    // Criar PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Fundo gradient (simulado com retângulos)
    doc.setFillColor(59, 130, 246) // blue-500
    doc.rect(0, 0, pageWidth, 40, 'F')

    // Logo/Título
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPROVANTE DE PRESENÇA', pageWidth / 2, 25, { align: 'center' })

    // Organização
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(presence.organizationName, pageWidth / 2, 35, { align: 'center' })

    // Corpo do documento
    doc.setTextColor(0, 0, 0)
    let yPosition = 60

    // Decoração
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 10

    // Texto principal
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Certificamos que', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Nome do participante
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const userName = presence.userName || 'Participante'
    doc.text(userName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // CPF
    if (presence.cpf) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const formattedCpf = presence.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      doc.text(`CPF: ${formattedCpf}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 12
    }

    // Texto de participação
    doc.setFontSize(12)
    doc.text('registrou presença no evento', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Nome do evento
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text(presence.eventTitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Data do evento
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    const eventDate = new Date(presence.startDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    doc.text(`Realizado em ${eventDate}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    // Horário de registro
    const registeredAt = new Date(presence.accessTimestamp).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
    doc.text(`Presença registrada em: ${registeredAt}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Linha decorativa
    doc.setDrawColor(59, 130, 246)
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 15

    // ID de verificação
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`ID de Verificação: ${presence.id}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 6
    doc.text(`Código do Evento: ${presence.eventId}`, pageWidth / 2, yPosition, { align: 'center' })

    // Rodapé
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const footerY = pageHeight - 20
    doc.text('Este é um documento gerado eletronicamente e possui validade sem assinatura.', pageWidth / 2, footerY, { align: 'center' })
    doc.setFontSize(8)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, footerY + 5, { align: 'center' })

    // Gerar PDF como buffer
    try {
      // jsPDF output('arraybuffer') retorna um ArrayBuffer
      const pdfArrayBuffer = doc.output('arraybuffer') as ArrayBuffer
      // Converter ArrayBuffer para Buffer via Uint8Array
      const pdfBuffer = Buffer.from(new Uint8Array(pdfArrayBuffer))

      // Preparar nome do arquivo
      const safeFileName = presence.eventTitle
        .replace(/[^a-zA-Z0-9\s]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 50) // Limitar tamanho
      const fileName = `Comprovante_${safeFileName}.pdf`
      
      // Retornar PDF com headers corretos
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
    } catch (pdfError: any) {
      console.error('Erro específico ao gerar buffer do PDF:', pdfError)
      throw new Error(`Erro ao gerar buffer do PDF: ${pdfError.message}`)
    }
  } catch (error: any) {
    console.error('Erro ao gerar comprovante:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

