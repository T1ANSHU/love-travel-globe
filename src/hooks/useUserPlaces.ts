import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { usePlaceStore } from '../store/placeStore'

export function useUserPlaces() {
  const user = useAuthStore((s) => s.user)
  const fetchUserPlaces = usePlaceStore((s) => s.fetchUserPlaces)

  useEffect(() => {
    if (user?.id) void fetchUserPlaces(user.id)
  }, [user?.id, fetchUserPlaces])
}
