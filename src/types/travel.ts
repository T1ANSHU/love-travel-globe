export interface BaseCountry {
  id: string
  name: string
  nameEn: string
  code: string // ISO 3166-1 alpha-2, e.g. "CN"
  centerLat: number
  centerLng: number
  defaultZoomLevel: number
  defaultLandmarkIds: string[]
}

export interface BaseCity {
  id: string
  name: string
  nameEn: string
  countryId: string
  lat: number
  lng: number
  province?: string
  isCapital?: boolean
  isMajorTouristCity?: boolean
  defaultLandmarkIds: string[]
}

export type LandmarkLevel = 'global' | 'country' | 'city'

export interface BaseLandmark {
  id: string
  name: string
  nameEn: string
  countryId: string
  cityId?: string
  lat: number
  lng: number
  level: LandmarkLevel
  modelUrl?: string
  iconUrl?: string
  appearZoomLevel: number // altitude (km) below which landmark becomes visible
  description: string
  soundEffect?: string
}
