import { useEffect, useCallback } from 'react'
import { useUser } from './useAuth'
import { usePhotoStore } from '../store/photoStore'

export function useUserPhotos() {
  const user = useUser()
  const { photos, loading, error, fetchPhotos } = usePhotoStore()

  const refetch = useCallback(() => {
    if (user) fetchPhotos(user.id)
  }, [user, fetchPhotos])

  useEffect(() => {
    if (user) fetchPhotos(user.id)
  }, [user, fetchPhotos])

  return { photos, loading, error, refetch }
}
