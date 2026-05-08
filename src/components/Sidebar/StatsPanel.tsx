import { useMemo } from 'react'
import { GlassCard } from '../UI/GlassCard'
import { usePhotoStore } from '../../store/photoStore'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function StatsPanel() {
  const photos = usePhotoStore((s) => s.photos)

  const stats = useMemo(() => {
    const countries = new Set(photos.map((p) => p.country_id)).size
    const cities = new Set(photos.filter((p) => p.city_id).map((p) => p.city_id)).size
    const total = photos.length

    const dates = photos.map((p) => p.taken_date).sort()
    const earliest = dates[0] ?? null
    const latest = dates[dates.length - 1] ?? null

    return { countries, cities, total, earliest, latest }
  }, [photos])

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-3">旅行统计</h3>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: '国家', value: stats.countries, icon: '🌍' },
          { label: '城市', value: stats.cities, icon: '🏙️' },
          { label: '照片', value: stats.total, icon: '📷' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/30 px-2 py-2 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-lg font-bold text-pink-700">{s.value}</div>
            <div className="text-[10px] text-pink-400">{s.label}</div>
          </div>
        ))}
      </div>
      {stats.total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-pink-400">最早旅行</span>
            <span className="text-pink-700 font-medium">{stats.earliest ? fmtDate(stats.earliest) : '—'}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-pink-400">最近旅行</span>
            <span className="text-pink-700 font-medium">{stats.latest ? fmtDate(stats.latest) : '—'}</span>
          </div>
        </div>
      )}
      {stats.total === 0 && (
        <p className="text-[10px] text-pink-300 text-center">上传第一张照片后，这里将显示旅行记录 💕</p>
      )}
    </GlassCard>
  )
}
