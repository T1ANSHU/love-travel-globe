// Placeholder for OAuth callback (Google / Apple) — Phase 5
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? '/' : '/login', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-dreamy flex items-center justify-center">
      <LoadingSpinner message="正在完成登录..." />
    </div>
  )
}
