export type PlaceType = 'country' | 'city' | 'landmark'

export interface UserPlace {
  id: string
  userId: string
  placeType: PlaceType
  countryId: string
  cityId?: string
  landmarkId?: string
  placeKey: string // generated: e.g. "country:CN", "city:CN:beijing"
  visited: boolean
  firstVisitDate?: string // ISO date "2024-01-12"
  lastVisitDate?: string
  notes?: string
  coverPhotoId?: string
  createdAt: string
  updatedAt: string
}

export interface VisitRecord {
  id: string
  userId: string
  countryId: string
  cityId?: string
  landmarkId?: string
  startDate: string // ISO date
  endDate?: string
  startTime?: string // "HH:MM"
  endTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: string // = userId
  autoRotate: boolean
  musicEnabled: boolean
  soundEffectsEnabled: boolean
  musicVolume: number // 0-1
  sfxVolume: number
  preferredLanguage: 'zh' | 'en'
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string // = userId
  displayName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}
