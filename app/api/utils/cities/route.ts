import { NextRequest, NextResponse } from 'next/server'

interface City {
    id: number
    nome: string
    microrregiao: {
        mesorregiao: {
            UF: {
                id: number
                sigla: string
                nome: string
            }
        }
    }
}

interface SimplifiedCity {
    id: number
    name: string
    state: string
}

let citiesCache: SimplifiedCity[] | null = null

async function getCities() {
    if (citiesCache) return citiesCache

    try {
        const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
        if (!res.ok) throw new Error('Failed to fetch cities')

        const data: City[] = await res.json()

        citiesCache = data.map(city => ({
            id: city.id,
            name: city.nome,
            state: city.microrregiao.mesorregiao.UF.sigla
        }))

        // Sort alphabetically
        citiesCache.sort((a, b) => a.name.localeCompare(b.name))

        return citiesCache
    } catch (error) {
        console.error('Error fetching cities:', error)
        return []
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase()

    if (!query || query.length < 2) {
        return NextResponse.json([])
    }

    const cities = await getCities()

    // Remove acentos da query para busca
    const cleanQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, "")

    const filtered = cities.filter(city => {
        const cleanName = city.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        // Busca exata no início ou contendo
        return cleanName.includes(cleanQuery)
    })

    // Prioritize startsWith
    filtered.sort((a, b) => {
        const cleanA = a.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        const cleanB = b.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        const startsA = cleanA.startsWith(cleanQuery)
        const startsB = cleanB.startsWith(cleanQuery)

        if (startsA && !startsB) return -1
        if (!startsA && startsB) return 1
        return 0
    })

    return NextResponse.json(filtered.slice(0, 10))
}
