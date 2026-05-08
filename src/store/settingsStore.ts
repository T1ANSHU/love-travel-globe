import { create } from 'zustand'
import { loadUserSettings, saveUserSettings, DEFAULT_SETTINGS } from '../services/settingsService'
import { audioService } from '../services/audioService'
import { useGlobeStore } from './globeStore'

// UI uses 0–100; DB uses 0.0–1.0. Conversion at load/save boundary.
interface SettingsState {
  autoRotate: boolean
  musicEnabled: boolean
  sfxEnabled: boolean
  musicVolume: number  // 0–100
  sfxVolume: number    // 0–100
  loaded: boolean
  load: (userId: string) => Promise<void>
  patch: (userId: string, delta: Partial<{
    autoRotate: boolean
    musicEnabled: boolean
    sfxEnabled: boolean
    musicVolume: number
    sfxVolume: number
  }>) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave(userId: string, getState: () => SettingsState) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const s = getState()
    saveUserSettings(userId, {
      auto_rotate: s.autoRotate,
      music_enabled: s.musicEnabled,
      sound_effects_enabled: s.sfxEnabled,
      music_volume: s.musicVolume / 100,
      sfx_volume: s.sfxVolume / 100,
    })
  }, 600)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  autoRotate: DEFAULT_SETTINGS.auto_rotate,
  musicEnabled: DEFAULT_SETTINGS.music_enabled,
  sfxEnabled: DEFAULT_SETTINGS.sound_effects_enabled,
  musicVolume: Math.round(DEFAULT_SETTINGS.music_volume * 100),
  sfxVolume: Math.round(DEFAULT_SETTINGS.sfx_volume * 100),
  loaded: false,

  load: async (userId) => {
    const row = await loadUserSettings(userId)
    const s = row
      ? {
          autoRotate: row.auto_rotate,
          musicEnabled: row.music_enabled,
          sfxEnabled: row.sound_effects_enabled,
          musicVolume: Math.round(row.music_volume * 100),
          sfxVolume: Math.round(row.sfx_volume * 100),
        }
      : {
          autoRotate: DEFAULT_SETTINGS.auto_rotate,
          musicEnabled: DEFAULT_SETTINGS.music_enabled,
          sfxEnabled: DEFAULT_SETTINGS.sound_effects_enabled,
          musicVolume: Math.round(DEFAULT_SETTINGS.music_volume * 100),
          sfxVolume: Math.round(DEFAULT_SETTINGS.sfx_volume * 100),
        }

    set({ ...s, loaded: true })

    // Sync side effects on load
    useGlobeStore.getState().setAutoRotate(s.autoRotate)
    audioService.setMusicVolume(s.musicVolume / 100)
    audioService.setSfxEnabled(s.sfxEnabled)
    audioService.setSfxVolume(s.sfxVolume / 100)
    if (s.musicEnabled) audioService.play()
  },

  patch: (userId, delta) => {
    set((prev) => ({ ...prev, ...delta }))

    // Sync side effects immediately
    if (delta.autoRotate !== undefined) {
      useGlobeStore.getState().setAutoRotate(delta.autoRotate)
    }
    if (delta.musicEnabled !== undefined) {
      delta.musicEnabled ? audioService.play() : audioService.pause()
    }
    if (delta.musicVolume !== undefined) {
      audioService.setMusicVolume(delta.musicVolume / 100)
    }
    if (delta.sfxEnabled !== undefined) {
      audioService.setSfxEnabled(delta.sfxEnabled)
    }
    if (delta.sfxVolume !== undefined) {
      audioService.setSfxVolume(delta.sfxVolume / 100)
    }

    scheduleSave(userId, get)
  },
}))
