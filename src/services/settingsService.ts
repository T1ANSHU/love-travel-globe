import { supabase } from '../lib/supabaseClient'
import type { DbUserSettings } from '../types/database'

// DB stores volume as 0.0–1.0 FLOAT
export const DEFAULT_SETTINGS = {
  auto_rotate: true,
  music_enabled: false,
  sound_effects_enabled: true,
  music_volume: 0.5,
  sfx_volume: 0.7,
  preferred_language: 'zh',
} as const

export async function loadUserSettings(userId: string): Promise<DbUserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as DbUserSettings
}

export async function saveUserSettings(
  userId: string,
  patch: Partial<Omit<DbUserSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  await supabase
    .from('user_settings')
    .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'id' })
}
