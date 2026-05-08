import { GlassCard } from '../UI/GlassCard'
import { useSettingsStore } from '../../store/settingsStore'
import { useGlobeStore } from '../../store/globeStore'
import { useUser } from '../../hooks/useAuth'

export function GlobeControlPanel() {
  const user = useUser()
  const autoRotate = useSettingsStore((s) => s.autoRotate)
  const patch = useSettingsStore((s) => s.patch)
  const setFlyToRequest = useGlobeStore((s) => s.setFlyToRequest)
  const showArcs = useGlobeStore((s) => s.showArcs)
  const setShowArcs = useGlobeStore((s) => s.setShowArcs)

  const toggleRotate = () => {
    if (user) patch(user.id, { autoRotate: !autoRotate })
  }

  const resetView = () => {
    setFlyToRequest({ lat: 20, lng: 110, altitude: 2.4 })
  }

  const toggleArcs = () => setShowArcs(!showArcs)

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-3">地图控制</h3>
      <div className="grid grid-cols-2 gap-2">
        {/* Auto-rotate toggle */}
        <button
          onClick={toggleRotate}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition border ${
            autoRotate
              ? 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200'
              : 'bg-white/40 text-pink-400 border-pink-200 hover:bg-pink-50'
          }`}
        >
          <span>{autoRotate ? '🔄' : '⏸️'}</span>
          <span>{autoRotate ? '自转中' : '已暂停'}</span>
        </button>

        {/* Reset view */}
        <button
          onClick={resetView}
          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-pink-600 bg-white/40 border border-pink-200 hover:bg-pink-50 transition"
        >
          <span>🌐</span>
          <span>全球视角</span>
        </button>

        {/* Travel arcs toggle */}
        <button
          onClick={toggleArcs}
          className={`col-span-2 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition border ${
            showArcs
              ? 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200'
              : 'bg-white/40 text-pink-400 border-pink-200 hover:bg-pink-50'
          }`}
        >
          <span>{showArcs ? '✨' : '〰️'}</span>
          <span>{showArcs ? '旅行路线已显示' : '显示旅行路线'}</span>
        </button>
      </div>
    </GlassCard>
  )
}
