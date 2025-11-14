import { NextRequest, NextResponse } from 'next/server'
import { organizationService } from '@/services/organization.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const organization = await organizationService.getOrganizationBySlug(
      params.slug
    )

    if (!organization) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
