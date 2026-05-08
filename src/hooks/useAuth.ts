import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

export function useAuthListener() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])
}

// Convenience selector hooks
export function useUser() {
  return useAuthStore((s) => s.user)
}

export function useSession() {
  return useAuthStore((s) => s.session)
}

export function useAuthLoading() {
  return useAuthStore((s) => s.loading)
}
