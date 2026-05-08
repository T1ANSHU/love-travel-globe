import { supabase } from '../lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  session: Session | null
  error: string | null
}

export async function signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) return { user: null, session: null, error: error.message }

  // Create profile row
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: displayName,
    })
    // Create default settings row
    await supabase.from('user_settings').upsert({
      id: data.user.id,
      auto_rotate: true,
      music_enabled: false,
      sound_effects_enabled: true,
      music_volume: 0.5,
      sfx_volume: 0.7,
      preferred_language: 'zh',
    })
  }

  return { user: data.user, session: data.session, error: null }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, session: null, error: error.message }
  return { user: data.user, session: data.session, error: null }
}

export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut()
  return { error: error ? error.message : null }
}

export async function getSession(): Promise<{ user: User | null; session: Session | null }> {
  const { data } = await supabase.auth.getSession()
  return { user: data.session?.user ?? null, session: data.session }
}
