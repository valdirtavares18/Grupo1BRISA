'use client'

import { Search, Filter, X } from 'lucide-react'
import { Input, Button } from '@/components/atoms'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'

interface AdminSearchBarProps {
    placeholder?: string
    showStatusFilter?: boolean
}

export function AdminSearchBar({
    placeholder = "Buscar...",
    showStatusFilter = true
}: AdminSearchBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')

    // Criar a query string baseada nos estados atuais
    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString())

            Object.entries(params).forEach(([name, value]) => {
                if (value === null || value === 'all' || value === '') {
                    newParams.delete(name)
                } else {
                    newParams.set(name, value)
                }
            })

            return newParams.toString()
        },
        [searchParams]
    )

    // Debounce para a busca por texto
    useEffect(() => {
        const timer = setTimeout(() => {
            const qs = createQueryString({ q: query })
            router.push(`${pathname}?${qs}`)
        }, 400)

        return () => clearTimeout(timer)
    }, [query, pathname, router, createQueryString])

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value
        setStatus(newStatus)
        const qs = createQueryString({ status: newStatus })
        router.push(`${pathname}?${qs}`)
    }

    const clearFilters = () => {
        setQuery('')
        setStatus('all')
        router.push(pathname)
    }

    const hasFilters = query !== '' || status !== 'all'

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B92A0] group-focus-within:text-mustard transition-colors" />
                <Input
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50 transition-all text-base"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-navy-light text-[#8B92A0] hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {showStatusFilter && (
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B92A0] pointer-events-none" />
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full h-12 pl-10 pr-4 bg-navy border border-navy-border rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-mustard/50 cursor-pointer transition-all text-base"
                    >
                        <option value="all" className="bg-slate-800 text-white">Todos os Status</option>
                        <option value="active" className="bg-slate-800 text-white">Ativas</option>
                        <option value="inactive" className="bg-slate-800 text-white">Inativas</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B92A0]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            )}

            {hasFilters && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-12 text-[#C8CDD5] hover:text-white hover:bg-navy-light gap-2 border border-navy-border"
                >
                    Limpar Filtros
                </Button>
            )}
        </div>
    )
}
