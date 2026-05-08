import { GlassCard } from '../UI/GlassCard'
import { useSettingsStore } from '../../store/settingsStore'
import { useUser } from '../../hooks/useAuth'

interface ToggleProps {
  checked: boolean
  onChange: () => void
  label: string
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center gap-2 w-full"
    >
      <div className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-pink-400' : 'bg-pink-200'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-xs text-pink-700">{label}</span>
    </button>
  )
}

export function MusicPanel() {
  const user = useUser()
  const { musicEnabled, sfxEnabled, musicVolume, sfxVolume, patch } = useSettingsStore()

  if (!user) return null

  const userId = user.id

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-3">音乐 & 音效</h3>

      <div className="space-y-3">
        {/* Music toggle */}
        <Toggle
          checked={musicEnabled}
          onChange={() => patch(userId, { musicEnabled: !musicEnabled })}
          label="背景音乐"
        />

        {/* Music volume */}
        {musicEnabled && (
          <div className="pl-10">
            <p className="text-[10px] text-pink-400 mb-1">音量 {musicVolume}%</p>
            <input
              type="range"
              min={0}
              max={100}
              value={musicVolume}
              onChange={(e) => patch(userId, { musicVolume: Number(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <p className="text-[9px] text-pink-300 mt-1">音乐文件将在 UI Polish 阶段添加</p>
          </div>
        )}

        <div className="border-t border-pink-100" />

        {/* SFX toggle */}
        <Toggle
          checked={sfxEnabled}
          onChange={() => patch(userId, { sfxEnabled: !sfxEnabled })}
          label="交互音效"
        />

        {/* SFX volume */}
        {sfxEnabled && (
          <div className="pl-10">
            <p className="text-[10px] text-pink-400 mb-1">音量 {sfxVolume}%</p>
            <input
              type="range"
              min={0}
              max={100}
              value={sfxVolume}
              onChange={(e) => patch(userId, { sfxVolume: Number(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <p className="text-[9px] text-pink-300 mt-1">音效文件将在 UI Polish 阶段添加</p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
