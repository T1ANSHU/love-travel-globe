import { useState, useMemo } from 'react'
import { GlassCard } from '../UI/GlassCard'
import { usePhotoStore, hasActiveFilters } from '../../store/photoStore'
import { COUNTRIES } from '../../data/countries'

export function FilterPanel() {
  const [open, setOpen] = useState(false)
  const photos = usePhotoStore((s) => s.photos)
  const filters = usePhotoStore((s) => s.filters)
  const setFilters = usePhotoStore((s) => s.setFilters)
  const resetFilters = usePhotoStore((s) => s.resetFilters)

  const options = useMemo(() => {
    const years = [...new Set(photos.map((p) => new Date(p.taken_date).getFullYear()))].sort((a, b) => b - a)
    const countryIds = [...new Set(photos.map((p) => p.country_id))]
    const tags = [...new Set(photos.flatMap((p) => p.tags))].sort()
    return { years, countryIds, tags }
  }, [photos])

  const active = hasActiveFilters(filters)
  const activeCount = [filters.countryId, filters.year, filters.dateFrom, filters.dateTo]
    .filter(Boolean).length + filters.tags.length

  return (
    <GlassCard className="p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
          筛选
          {active && (
            <span className="ml-2 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-pink-500 text-white text-[9px] font-bold">
              {activeCount}
            </span>
          )}
        </h3>
        <span className="text-pink-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Year */}
          {options.years.length > 0 && (
            <div>
              <p className="text-[10px] text-pink-400 mb-1">年份</p>
              <div className="flex flex-wrap gap-1">
                {options.years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setFilters({ year: filters.year === y ? null : y })}
                    className={`px-2 py-0.5 rounded-full text-xs border transition ${
                      filters.year === y
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white/50 text-pink-600 border-pink-200 hover:border-pink-400'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Country */}
          {options.countryIds.length > 0 && (
            <div>
              <p className="text-[10px] text-pink-400 mb-1">国家</p>
              <select
                value={filters.countryId ?? ''}
                onChange={(e) => setFilters({ countryId: e.target.value || null })}
                className="w-full rounded-lg border border-pink-200 bg-white/50 px-2 py-1.5 text-xs text-pink-700 focus:outline-none focus:border-pink-400"
              >
                <option value="">全部国家</option>
                {options.countryIds.map((id) => {
                  const c = COUNTRIES.find((x) => x.id === id)
                  return (
                    <option key={id} value={id}>
                      {c ? `${c.name} (${c.nameEn})` : id}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Date range — two full-width rows to avoid overflow */}
          <div>
            <p className="text-[10px] text-pink-400 mb-1">日期范围</p>
            <div className="space-y-1.5">
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => setFilters({ dateFrom: e.target.value || null })}
                className="w-full rounded-lg border border-pink-200 bg-white/50 px-2 py-1.5 text-xs text-pink-700 focus:outline-none focus:border-pink-400"
              />
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => setFilters({ dateTo: e.target.value || null })}
                className="w-full rounded-lg border border-pink-200 bg-white/50 px-2 py-1.5 text-xs text-pink-700 focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Tags */}
          {options.tags.length > 0 && (
            <div>
              <p className="text-[10px] text-pink-400 mb-1">标签</p>
              <div className="flex flex-wrap gap-1">
                {options.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const next = filters.tags.includes(tag)
                        ? filters.tags.filter((t) => t !== tag)
                        : [...filters.tags, tag]
                      setFilters({ tags: next })
                    }}
                    className={`px-2 py-0.5 rounded-full text-xs border transition ${
                      filters.tags.includes(tag)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white/50 text-pink-600 border-pink-200 hover:border-pink-400'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear */}
          {active && (
            <button
              onClick={resetFilters}
              className="w-full text-xs text-pink-400 hover:text-rose-500 transition py-1"
            >
              清除全部筛选 ✕
            </button>
          )}

          {options.years.length === 0 && options.tags.length === 0 && (
            <p className="text-[10px] text-pink-300 text-center">上传照片后可在此筛选</p>
          )}

          {/* Hint */}
          <p className="text-[9px] text-pink-400 text-center pt-0.5">
            筛选完成后，点「所有相册」查看回忆结果 💕
          </p>
        </div>
      )}
    </GlassCard>
  )
}
