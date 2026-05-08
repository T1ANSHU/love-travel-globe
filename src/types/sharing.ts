// Stub types — placeholders for future couple/shared album feature.
// Phase 5 does NOT depend on these. Do not import in production paths yet.

export interface CoupleProfile {
  id: string
  primaryUserId: string
  partnerUserId: string
  pairedAt: string  // ISO datetime
  status: 'pending' | 'active' | 'inactive'
}

export interface SharedAlbum {
  id: string
  coupleId: string
  title: string
  description?: string
  coverPhotoId?: string
  createdAt: string
  updatedAt: string
}

export interface SharedAlbumPhoto {
  id: string
  sharedAlbumId: string
  photoId: string
  ownerUserId: string
  addedAt: string
}
