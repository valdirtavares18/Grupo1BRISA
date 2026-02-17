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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 transition-all text-base"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {showStatusFilter && (
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full h-12 pl-10 pr-4 bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer hover:bg-white/15 transition-all text-base"
                    >
                        <option value="all" className="bg-slate-800 text-white">Todos os Status</option>
                        <option value="active" className="bg-slate-800 text-white">Ativas</option>
                        <option value="inactive" className="bg-slate-800 text-white">Inativas</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
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
                    className="h-12 text-white/70 hover:text-white hover:bg-white/10 gap-2 border border-white/10"
                >
                    Limpar Filtros
                </Button>
            )}
        </div>
    )
}
