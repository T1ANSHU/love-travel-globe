import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { COUNTRIES } from '../../data/countries'
import { CITIES } from '../../data/cities'
import { GlassCard } from '../UI/GlassCard'
import { usePlaceStore } from '../../store/placeStore'
import { resolvePlace } from '../../services/placeResolver'
import type { PlaceResult } from '../../types/place'
import type { AchievementPlace } from './PlaceAchievement'

interface AddPlaceModalProps {
  onClose: () => void
  onPlaceAdded?: (place: AchievementPlace) => void
}

type SearchResult =
  | {
      kind: 'city'
      id: string
      name: string
      nameEn: string
      countryName: string
      countryId: string
      isCapital?: boolean
    }
  | {
      kind: 'country'
      id: string
      name: string
      nameEn: string
      hasCapital: boolean
    }

export function AddPlaceModal({ onClose, onPlaceAdded }: AddPlaceModalProps) {
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set())
  // Resolver hint shown only when the direct search finds nothing
  const [resolverHint, setResolverHint] = useState<PlaceResult | null>(null)

  const addCity = usePlaceStore((s) => s.addCity)
  const addCountry = usePlaceStore((s) => s.addCountry)
  const userAddedCityIds = usePlaceStore((s) => s.userAddedCityIds)
  const userAddedCountryIds = usePlaceStore((s) => s.userAddedCountryIds)

  const countryNameMap = useMemo(
    () => new Map(COUNTRIES.map((c) => [c.id, c.name])),
    [],
  )

  // Direct multi-result search across local CITIES + COUNTRIES (unchanged behavior)
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const out: SearchResult[] = []

    for (const c of COUNTRIES) {
      if (
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q
      ) {
        const hasCapital = CITIES.some((city) => city.countryId === c.id && city.isCapital)
        out.push({ kind: 'country', id: c.id, name: c.name, nameEn: c.nameEn, hasCapital })
      }
    }

    for (const c of CITIES) {
      if (c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)) {
        out.push({
          kind: 'city',
          id: c.id,
          name: c.name,
          nameEn: c.nameEn,
          countryName: countryNameMap.get(c.countryId) ?? c.countryId,
          countryId: c.countryId,
          isCapital: c.isCapital,
        })
      }
    }

    return out.slice(0, 20)
  }, [query, countryNameMap])

  // When direct search finds nothing, ask placeResolver for an informative hint.
  // Local resolution is O(1) so this is effectively instant for local data.
  // When Step 2 (Geoapify) is added, this is where external lookup will also kick in.
  useEffect(() => {
    const q = query.trim()
    if (!q || results.length > 0) {
      setResolverHint(null)
      return
    }
    let alive = true
    resolvePlace(q).then((r) => {
      if (alive) setResolverHint(r)
    })
    return () => { alive = false }
  }, [query, results.length])

  const handleAdd = async (result: SearchResult) => {
    const key = `${result.kind}:${result.id}`
    setAdding(key)
    try {
      // Resolve through placeResolver to normalize data and validate.
      // For local data this is O(1); when Geoapify is added in Step 2
      // the resolver will supply lat/lng and canonical IDs from the API.
      const resolved = await resolvePlace(result.id)
      if (!resolved.found) {
        // Defensive: shouldn't happen for items from the local search
        return
      }

      let res: { ok: true } | { error: string }
      if (result.kind === 'city') {
        res = await addCity(resolved.cityId ?? result.id, resolved.countryId)
      } else {
        res = await addCountry(resolved.countryId)
      }

      if ('ok' in res) {
        setJustAdded((prev) => new Set([...prev, key]))
        // Close modal immediately on success so the achievement animation is unobstructed.
        // onClose + onPlaceAdded both update GlobePage state; React 18 batches them into
        // one render, so the modal disappears and the achievement starts in the same frame.
        onClose()
        if (onPlaceAdded) {
          if (result.kind === 'city') {
            onPlaceAdded({
              kind: 'city',
              name: resolved.displayName,
              countryName: resolved.countryName,
              isCapital: resolved.isCapital,
            })
          } else {
            const capital = CITIES.find((c) => c.countryId === resolved.countryId && c.isCapital)
            onPlaceAdded({ kind: 'country', name: resolved.displayName, capitalName: capital?.name })
          }
        }
      }
    } finally {
      setAdding(null)
    }
  }

  const isAdded = (result: SearchResult): boolean => {
    const key = `${result.kind}:${result.id}`
    if (justAdded.has(key)) return true
    if (result.kind === 'city') return userAddedCityIds.has(result.id)
    if (result.kind === 'country') return userAddedCountryIds.has(result.id)
    return false
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <GlassCard className="pointer-events-auto w-full max-w-md bg-white/90 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 flex-shrink-0">
            <h2 className="text-base font-bold text-pink-800">📍 添加国家 / 城市</h2>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-500 flex items-center justify-center text-sm transition"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 flex-shrink-0">
            <input
              type="text"
              placeholder="搜索城市或国家（中文或英文）"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-pink-200 bg-white/70 px-3 py-2 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            {query.trim() === '' ? (
              <p className="text-xs text-pink-400 text-center py-8">
                输入城市或国家名称进行搜索 🔍
              </p>
            ) : results.length > 0 ? (
              <ul className="space-y-2">
                {results.map((r) => {
                  const key = `${r.kind}:${r.id}`
                  const added = isAdded(r)
                  const busy = adding === key
                  return (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/50 border border-pink-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-pink-800">{r.name}</span>
                          <span className="text-[10px] text-pink-400">{r.nameEn}</span>
                          {r.kind === 'city' && r.isCapital && (
                            <span className="text-[9px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full">
                              首都
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-pink-400 mt-0.5">
                          {r.kind === 'city'
                            ? `🏙️ 城市 · ${r.countryName}`
                            : '🌍 国家'}
                          {r.kind === 'country' && !r.hasCapital && (
                            <span className="ml-1 text-amber-500">（当前数据暂无首都）</span>
                          )}
                        </div>
                      </div>

                      <button
                        disabled={added || busy}
                        onClick={() => handleAdd(r)}
                        className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                          added
                            ? 'bg-pink-50 text-pink-300 cursor-default'
                            : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 active:scale-95'
                        }`}
                      >
                        {busy ? '添加中…' : added ? '✓ 已添加' : '+ 添加'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : resolverHint?.found ? (
              // Resolver found something (likely a landmark) but it can't be added directly
              <div className="py-8 text-center space-y-1.5">
                <p className="text-sm font-semibold text-pink-700">
                  {resolverHint.displayName}
                  <span className="ml-1.5 text-[10px] font-normal text-pink-400">
                    {resolverHint.displayNameEn}
                  </span>
                </p>
                <p className="text-[10px] text-pink-400">{resolverHint.countryName}</p>
                <p className="mt-2 text-xs text-amber-600">
                  {resolverHint.type === 'landmark'
                    ? '已找到该地标，暂不支持直接添加。请搜索所在城市进行添加。'
                    : '该地点暂不支持直接添加。'}
                </p>
              </div>
            ) : (
              // Not found in any local dataset — show resolver message
              <p className="text-xs text-pink-400 text-center py-8">
                {resolverHint?.message ?? '没有找到匹配的城市或国家'}
              </p>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2 border-t border-pink-100 flex-shrink-0">
            <p className="text-[10px] text-pink-400 text-center">
              添加后城市将出现在地球上 · 目前仅支持已收录城市 💕
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </>
  )
}
