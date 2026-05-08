import { useEffect } from 'react'
import { useUser } from './useAuth'
import { useSettingsStore } from '../store/settingsStore'

export function useSettings() {
  const user = useUser()
  const loaded = useSettingsStore((s) => s.loaded)
  const load = useSettingsStore((s) => s.load)

  useEffect(() => {
    if (user && !loaded) load(user.id)
  }, [user, loaded, load])
}
