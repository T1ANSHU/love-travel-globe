import { useMemo } from 'react'
import { usePhotoStore } from '../store/photoStore'
import { CITIES } from '../data/cities'

// Derive visited countries / cities from photoStore.photos
//
// - visitedCountryIds: any photo with country_id counts (country-only photos included)
// - visitedCityIds: only photos with city_id AND city found in CITIES (need lat/lng for highlight)
export function useVisitedPlaces() {
  const photos = usePhotoStore((s) => s.photos)

  return useMemo(() => {
    const visitedCountryIds = new Set<string>()
    const visitedCityIds = new Set<string>()

    for (const p of photos) {
      if (p.country_id) visitedCountryIds.add(p.country_id)
      if (p.city_id && CITIES.some((c) => c.id === p.city_id)) {
        visitedCityIds.add(p.city_id)
      }
    }

    return { visitedCountryIds, visitedCityIds }
  }, [photos])
}
