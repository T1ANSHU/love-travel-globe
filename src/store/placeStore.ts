import { create } from 'zustand'
import { getUserPlaces, addUserPlace } from '../services/visitService'
import { useAuthStore } from './authStore'
import { CITIES, getCityById } from '../data/cities'
import type { ResolvedPlace } from '../types/place'

interface PlaceStoreState {
  userAddedCityIds: Set<string>
  userAddedCountryIds: Set<string>
  /** In-memory map of Geoapify-sourced places (place_id → ResolvedPlace). Persists in Supabase but
   *  only rehydrated here on the current session — globe rendering reads this for extra markers. */
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
      for (const p of places) {
        if (p.place_type === 'city' && p.city_id) {
          const city = getCityById(p.city_id)
          if (city) cityIds.add(city.id)
        }
        if (p.place_type === 'country') {
          countryIds.add(p.country_id)
          // When a country was added, also surface its capital
          const capital = CITIES.find((c) => c.countryId === p.country_id && c.isCapital)
          if (capital) cityIds.add(capital.id)
        }
      }
      set({ userAddedCityIds: cityIds, userAddedCountryIds: countryIds, loading: false })
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
      return { userAddedCityIds: newCityIds }
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
