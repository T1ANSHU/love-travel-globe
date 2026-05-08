import { GlassCard } from '../UI/GlassCard'
import { useReplayStore, type ReplaySpeed } from '../../store/replayStore'
import { useReplay } from '../../hooks/useReplay'

const SPEEDS: ReplaySpeed[] = [0.5, 1, 2]

export function ReplayPanel() {
  const { stops, currentIndex, playing } = useReplay()
  const speed = useReplayStore((s) => s.speed)
  const setPlaying = useReplayStore((s) => s.setPlaying)
  const setCurrentIndex = useReplayStore((s) => s.setCurrentIndex)
  const setSpeed = useReplayStore((s) => s.setSpeed)
  const reset = useReplayStore((s) => s.reset)

  const total = stops.length
  const canPlay = total >= 2
  const currentStop = stops[currentIndex]

  const togglePlay = () => {
    if (!canPlay) return
    if (playing) {
      setPlaying(false)
    } else {
      // If reached end, restart from 0
      if (currentIndex >= total) setCurrentIndex(0)
      setPlaying(true)
    }
  }

  const handleStop = () => {
    reset()
  }

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-3">路线回放</h3>

      {!canPlay ? (
        <p className="text-[10px] text-pink-300 text-center py-2">
          至少需要 2 个不同城市的照片才能回放路线 💫
        </p>
      ) : (
        <>
          {/* Current stop */}
          <div className="mb-3 rounded-xl bg-white/40 px-3 py-2 border border-pink-100">
            <div className="text-[10px] text-pink-400">当前位置</div>
            <div className="text-sm font-semibold text-pink-800 truncate">
              {currentStop?.cityName ?? '—'}
            </div>
            <div className="text-[10px] text-pink-500 mt-0.5">
              {currentIndex + 1} / {total}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3 h-1 rounded-full bg-pink-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-300 to-rose-400 transition-all duration-300"
              style={{ width: `${total > 0 ? ((currentIndex + 1) / total) * 100 : 0}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={togglePlay}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 transition shadow-sm"
            >
              <span>{playing ? '⏸️' : '▶️'}</span>
              <span>{playing ? '暂停' : '播放'}</span>
            </button>
            <button
              onClick={handleStop}
              className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-pink-600 bg-white/40 border border-pink-200 hover:bg-pink-50 transition"
            >
              <span>⏹️</span>
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-pink-400">速度</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`flex-1 rounded-lg py-1 text-[11px] font-medium transition border ${
                  speed === s
                    ? 'bg-pink-100 text-pink-700 border-pink-300'
                    : 'bg-white/40 text-pink-400 border-pink-200 hover:bg-pink-50'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  )
}
