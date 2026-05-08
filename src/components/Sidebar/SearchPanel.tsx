import { useState, useMemo } from 'react'
import { GlassCard } from '../UI/GlassCard'
import { CITIES } from '../../data/cities'
import { COUNTRIES } from '../../data/countries'
import { useGlobeStore } from '../../store/globeStore'

type SearchResult =
  | { kind: 'city'; id: string; name: string; nameEn: string; countryId: string; lat: number; lng: number }
  | { kind: 'country'; id: string; name: string; nameEn: string; lat: number; lng: number }

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const setFlyToRequest = useGlobeStore((s) => s.setFlyToRequest)

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []

    const cities: SearchResult[] = CITIES
      .filter((c) => c.name.includes(q) || c.nameEn.toLowerCase().includes(q))
      .slice(0, 6)
      .map((c) => ({ kind: 'city', id: c.id, name: c.name, nameEn: c.nameEn, countryId: c.countryId, lat: c.lat, lng: c.lng }))

    const countries: SearchResult[] = COUNTRIES
      .filter((c) => c.name.includes(q) || c.nameEn.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ kind: 'country', id: c.id, name: c.name, nameEn: c.nameEn, lat: c.centerLat, lng: c.centerLng }))

    return [...cities, ...countries].slice(0, 8)
  }, [query])

  const handleSelect = (r: SearchResult) => {
    setFlyToRequest({ lat: r.lat, lng: r.lng, altitude: r.kind === 'city' ? 1.0 : 1.6 })
    setQuery('')
  }

  // Outer wrapper has z-10 (position:relative + z-index > 0) so its stacking context
  // sits above every sibling GlassCard's backdrop-filter stacking context (z-index:auto = 0).
  // The dropdown is placed OUTSIDE the GlassCard so it isn't clipped by glass-card's context.
  return (
    <div className="relative z-10">
      <GlassCard className="p-4">
        <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">搜索</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索国家或城市..."
          className="w-full rounded-xl border border-pink-200 bg-white/50 px-3 py-2 text-sm text-pink-700 placeholder-pink-300 focus:outline-none focus:border-pink-400 transition"
        />
      </GlassCard>

      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-pink-100 bg-white/95 backdrop-blur shadow-lg overflow-hidden">
          {results.map((r) => (
            <button
              key={r.kind + r.id}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-pink-50 transition"
            >
              <span className="text-sm">{r.kind === 'city' ? '🏙️' : '🌍'}</span>
              <span className="flex-1 min-w-0">
                <span className="text-sm font-medium text-pink-800">{r.name}</span>
                <span className="text-xs text-pink-400 ml-1">{r.nameEn}</span>
                {r.kind === 'city' && (
                  <span className="text-xs text-pink-300 ml-1">· {r.countryId}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
