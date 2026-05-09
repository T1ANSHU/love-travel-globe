import { create } from 'zustand'
import { getUserPlaces, addUserPlace } from '../services/visitService'
import { useAuthStore } from './authStore'
import { CITIES, getCityById } from '../data/cities'
import type { ResolvedPlace } from '../types/place'

interface PlaceStoreState {
  userAddedCityIds: Set<string>
  userAddedCountryIds: Set<string>
  /** Geoapify-sourced places (place_id → ResolvedPlace). Persisted to Supabase and rehydrated on
   *  fetchUserPlaces. Globe rendering reads this map to display geocoded markers + labels. */
  geocodedPlaces: Map<string, ResolvedPlace>
  loading: boolean
  fetchUserPlaces: (userId: string) => Promise<void>
  addCity: (cityId: string, countryId: string) => Promise<{ ok: true } | { error: string }>
  addCountry: (countryId: string) => Promise<{ ok: true } | { error: string }>
  addGeocodedPlace: (place: ResolvedPlace) => Promise<{ ok: true } | { error: string }>
  removeCityId: (cityId: string) => void
}

export const usePlaceStore = create<PlaceStoreState>((set) => ({
  userAddedCityIds: new Set(),
  userAddedCountryIds: new Set(),
  geocodedPlaces: new Map(),
  loading: false,

  fetchUserPlaces: async (userId: string) => {
    set({ loading: true })
    try {
      const places = await getUserPlaces(userId)
      const cityIds = new Set<string>()
      const countryIds = new Set<string>()
      const geocodedPlaces = new Map<string, ResolvedPlace>()

      for (const p of places) {
        if (p.place_type === 'city' && p.city_id) {
          const city = getCityById(p.city_id)
          if (city) {
            // Local city — resolved by static data
            cityIds.add(city.id)
          } else if (
            p.place_source === 'geocoding_api' &&
            p.lat != null && p.lng != null && p.display_name
          ) {
            // Geocoded city — reconstruct ResolvedPlace from persisted fields
            const restored: ResolvedPlace = {
              found: true,
              type: 'city',
              id: p.city_id,
              displayName: p.display_name,
              displayNameEn: p.name_en ?? p.display_name,
              countryId: p.country_id,
              countryName: p.country_name ?? p.country_id,
              lat: p.lat,
              lng: p.lng,
              cityId: p.city_id,
              isCapital: false,
              source: 'geocoding_api',
            }
            geocodedPlaces.set(p.city_id, restored)
            cityIds.add(p.city_id)
          }
        }
        if (p.place_type === 'country') {
          countryIds.add(p.country_id)
          const capital = CITIES.find((c) => c.countryId === p.country_id && c.isCapital)
          if (capital) cityIds.add(capital.id)
        }
      }
      set({ userAddedCityIds: cityIds, userAddedCountryIds: countryIds, geocodedPlaces, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addCity: async (cityId: string, countryId: string) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: '未登录' }
    const result = await addUserPlace(userId, { placeType: 'city', countryId, cityId })
    if ('ok' in result) {
      set((s) => ({ userAddedCityIds: new Set([...s.userAddedCityIds, cityId]) }))
    }
    return result
  },

  addGeocodedPlace: async (place: ResolvedPlace) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: '未登录' }
    const result = await addUserPlace(userId, {
      placeType: place.type === 'country' ? 'country' : 'city',
      countryId: place.countryId,
      cityId: place.type === 'city' ? place.id : null,
      placeSource: 'geocoding_api',
      displayName: place.displayName,
      nameEn: place.displayNameEn,
      countryName: place.countryName,
      lat: place.lat,
      lng: place.lng,
    })
    if ('ok' in result) {
      set((s) => {
        const newGeocodedPlaces = new Map(s.geocodedPlaces)
        newGeocodedPlaces.set(place.id, place)
        return {
          geocodedPlaces: newGeocodedPlaces,
          userAddedCityIds: new Set([...s.userAddedCityIds, place.id]),
        }
      })
    }
    return result
  },

  removeCityId: (cityId) =>
    set((s) => {
      const newCityIds = new Set(s.userAddedCityIds)
      newCityIds.delete(cityId)
      // Also evict from geocodedPlaces so the globe marker/label disappears immediately
      if (!s.geocodedPlaces.has(cityId)) {
        return { userAddedCityIds: newCityIds }
      }
      const newGeocodedPlaces = new Map(s.geocodedPlaces)
      newGeocodedPlaces.delete(cityId)
      return { userAddedCityIds: newCityIds, geocodedPlaces: newGeocodedPlaces }
    }),

  addCountry: async (countryId: string) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: '未登录' }
    const result = await addUserPlace(userId, { placeType: 'country', countryId })
    if ('ok' in result) {
      const capital = CITIES.find((c) => c.countryId === countryId && c.isCapital)
      set((s) => {
        const newCityIds = new Set(s.userAddedCityIds)
        if (capital) newCityIds.add(capital.id)
        return {
          userAddedCountryIds: new Set([...s.userAddedCountryIds, countryId]),
          userAddedCityIds: newCityIds,
        }
      })
    }
    return result
  },
}))
