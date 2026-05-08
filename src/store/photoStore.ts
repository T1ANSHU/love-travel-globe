import { create } from 'zustand'
import { getUserPhotos, createSignedUrls } from '../services/photoService'
import type { DbPhoto } from '../types/database'

export interface PhotoWithUrl extends DbPhoto {
  displayUrl: string
}

export interface PhotoFilters {
  countryId: string | null
  cityId: string | null
  year: number | null
  tags: string[]
  dateFrom: string | null  // ISO date string YYYY-MM-DD
  dateTo: string | null
}

export const EMPTY_FILTERS: PhotoFilters = {
  countryId: null,
  cityId: null,
  year: null,
  tags: [],
  dateFrom: null,
  dateTo: null,
}

export function applyPhotoFilters(photos: PhotoWithUrl[], filters: PhotoFilters): PhotoWithUrl[] {
  return photos.filter((p) => {
    if (filters.countryId && p.country_id !== filters.countryId) return false
    if (filters.cityId && p.city_id !== filters.cityId) return false
    if (filters.year && new Date(p.taken_date).getFullYear() !== filters.year) return false
    if (filters.dateFrom && p.taken_date < filters.dateFrom) return false
    if (filters.dateTo && p.taken_date > filters.dateTo) return false
    if (filters.tags.length > 0 && !filters.tags.some((t) => p.tags.includes(t))) return false
    return true
  })
}

export function hasActiveFilters(filters: PhotoFilters): boolean {
  return (
    filters.countryId !== null ||
    filters.cityId !== null ||
    filters.year !== null ||
    filters.tags.length > 0 ||
    filters.dateFrom !== null ||
    filters.dateTo !== null
  )
}

interface PhotoStoreState {
  photos: PhotoWithUrl[]
  loading: boolean
  error: string | null
  filters: PhotoFilters
  fetchPhotos: (userId: string) => Promise<void>
  removePhotos: (ids: string[]) => void
  setFilters: (f: Partial<PhotoFilters>) => void
  resetFilters: () => void
}

export const usePhotoStore = create<PhotoStoreState>((set) => ({
  photos: [],
  loading: false,
  error: null,
  filters: EMPTY_FILTERS,

  fetchPhotos: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const dbPhotos = await getUserPhotos(userId)
      const paths = dbPhotos.map((p) => p.file_path)
      const urlMap = await createSignedUrls(paths)
      set({
        photos: dbPhotos.map((p) => ({
          ...p,
          // Guard against NULL from DB despite string[] type — ensures safe flatMap/includes
          tags: Array.isArray(p.tags) ? p.tags : [],
          displayUrl: urlMap.get(p.file_path) ?? '',
        })),
        loading: false,
      })
    } catch {
      set({ error: '加载照片失败', loading: false })
    }
  },

  removePhotos: (ids) =>
    set((s) => ({ photos: s.photos.filter((p) => !ids.includes(p.id)) })),
  setFilters: (f) => set((prev) => ({ filters: { ...prev.filters, ...f } })),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
}))
