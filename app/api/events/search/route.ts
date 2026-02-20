import { NextRequest, NextResponse } from 'next/server'
import { eventSearchService } from '@/services/event-search.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters = {
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      zipCode: searchParams.get('zipCode') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      organizationId: searchParams.get('organizationId') || undefined,
      latitude: searchParams.get('latitude')
        ? parseFloat(searchParams.get('latitude')!)
        : undefined,
      longitude: searchParams.get('longitude')
        ? parseFloat(searchParams.get('longitude')!)
        : undefined,
      radius: searchParams.get('radius')
        ? parseFloat(searchParams.get('radius')!)
        : undefined,
    }

    const events = await eventSearchService.searchEventsByLocation(filters)

    return NextResponse.json(events)
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar eventos' },
      { status: 500 }
    )
  }
}

