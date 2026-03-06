'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/atoms'
import { MapPin, Loader2 } from 'lucide-react'

interface CityAutocompleteProps {
    value: string
    onChange: (city: string, state: string) => void
    disabled?: boolean
    className?: string
}

interface CityOption {
    id: number
    name: string
    state: string
}

export function CityAutocomplete({ value, onChange, disabled, className }: CityAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value)
    const [suggestions, setSuggestions] = useState<CityOption[]>([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = async (query: string) => {
        setInputValue(query)

        if (query.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/utils/cities?q=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                setSuggestions(data)
                setShowSuggestions(true)
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (city: CityOption) => {
        setInputValue(city.name)
        onChange(city.name, city.state)
        setSuggestions([])
        setShowSuggestions(false)
    }

    return (
        <div className="relative w-full" ref={inputRef as any}>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#8B92A0]" />
            <Input
                type="text"
                placeholder="Buscar por cidade..."
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={disabled}
                className={`pl-12 bg-navy border-navy-border placeholder:text-[#8B92A0] focus:border-mustard/50 ${className}`}
                onFocus={() => {
                    if (inputValue.length >= 2) setShowSuggestions(true)
                }}
            />
            {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#8B92A0]" />
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-navy-border rounded-lg shadow-md max-h-60 overflow-y-auto">
                    {suggestions.map((city) => (
                        <button
                            key={city.id}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-navy-light text-white flex items-center justify-between group transition-colors"
                            onClick={() => handleSelect(city)}
                        >
                            <span>{city.name}</span>
                            <span className="text-[#8B92A0] group-hover:text-[#8B92A0] text-sm font-mono bg-navy-light px-2 py-0.5 rounded">
                                {city.state}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
