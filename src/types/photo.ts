export type PhotoVisibility = 'private' | 'shared' | 'public'

export type AlbumType = 'country' | 'city' | 'landmark' | 'custom'

export interface Photo {
  id: string
  userId: string
  fileUrl: string
  filePath: string // Storage path for deletion
  fileName: string
  title?: string
  countryId: string
  cityId?: string
  landmarkId?: string
  takenDate: string // ISO date "2024-01-12"
  takenTime?: string // "HH:MM"
  uploadedAt: string
  notes?: string
  tags: string[]
  visibility: PhotoVisibility
  createdAt: string
  updatedAt: string
}

export interface Album {
  id: string
  userId: string
  albumType: AlbumType
  countryId?: string
  cityId?: string
  landmarkId?: string
  title: string
  description?: string
  coverPhotoId?: string
  createdAt: string
  updatedAt: string
}
