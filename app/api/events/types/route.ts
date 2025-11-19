import { NextRequest, NextResponse } from 'next/server'
import { eventSearchService } from '@/services/event-search.service'

export async function GET(request: NextRequest) {
  try {
    const eventTypes = await eventSearchService.getEventTypes()
    return NextResponse.json(eventTypes)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar tipos de eventos' },
      { status: 500 }
    )
  }
}

