import { useMemo, useState } from 'react'
import { GlassCard } from '../UI/GlassCard'
import { usePhotoStore } from '../../store/photoStore'
import { useGlobeStore } from '../../store/globeStore'
import { getCityById } from '../../data/cities'
import { getCountryById } from '../../data/countries'

interface TimelineEntry {
  date: string                  // YYYY-MM-DD
  countryId: string
  cityId: string | null
  countryName: string
  placeName: string             // city name if any, else country name
  photoCount: number
  flyTo: { lat: number; lng: number; altitude: number } | null
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function TimelinePanel() {
  const photos = usePhotoStore((s) => s.photos)
  const setFlyToRequest = useGlobeStore((s) => s.setFlyToRequest)
  const [expanded, setExpanded] = useState(false)

  const entries = useMemo<TimelineEntry[]>(() => {
    // Group by date + city|country, then aggregate
    const map = new Map<string, TimelineEntry>()
    for (const p of photos) {
      const key = `${p.taken_date}__${p.country_id}__${p.city_id ?? ''}`
      const existing = map.get(key)
      if (existing) {
        existing.photoCount += 1
        continue
      }
      const country = getCountryById(p.country_id)
      const city = p.city_id ? getCityById(p.city_id) : undefined
      const flyTo = city
        ? { lat: city.lat, lng: city.lng, altitude: 1.0 }
        : country
          ? { lat: country.centerLat, lng: country.centerLng, altitude: 1.6 }
          : null
      map.set(key, {
        date: p.taken_date,
        countryId: p.country_id,
        cityId: p.city_id ?? null,
        countryName: country?.name ?? p.country_id,
        placeName: city?.name ?? country?.name ?? p.country_id,
        photoCount: 1,
        flyTo,
      })
    }
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date))
  }, [photos])

  const visibleEntries = expanded ? entries : entries.slice(0, 5)

  const handleClick = (e: TimelineEntry) => {
    if (!e.flyTo) return
    setFlyToRequest(e.flyTo)
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide">旅行时间线</h3>
        {entries.length > 5 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] text-pink-500 hover:text-pink-700 transition"
          >
            {expanded ? '收起' : `查看全部 ${entries.length}`}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-[10px] text-pink-300 text-center py-2">
          上传照片后，这里将按时间线展示你们的旅行 ✨
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {visibleEntries.map((e) => (
            <li key={`${e.date}-${e.countryId}-${e.cityId ?? ''}`}>
              <button
                onClick={() => handleClick(e)}
                disabled={!e.flyTo}
                className="w-full text-left rounded-xl bg-white/40 hover:bg-pink-50 transition px-3 py-2 border border-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-pink-400 font-mono">{fmtDate(e.date)}</span>
                  <span className="text-[10px] text-pink-500">📷 {e.photoCount}</span>
                </div>
                <div className="text-sm font-semibold text-pink-800 truncate">
                  {e.cityId
                    ? `${e.countryName} — ${e.placeName}`
                    : e.countryName}
                </div>
                {!e.cityId && (
                  <div className="text-[10px] text-pink-400">仅国家记录</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
