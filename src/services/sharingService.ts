// Stub service — placeholder for future couple-pairing & shared album feature.
// Phase 5 does NOT use this; visibility selector in UploadPhotoForm only sets
// the `visibility` column on the user's own photo row. No real cross-user
// access is granted, RLS is unchanged.

import type { CoupleProfile, SharedAlbum } from '../types/sharing'

export async function getCoupleProfile(_userId: string): Promise<CoupleProfile | null> {
  // TODO(Phase 6): look up couple pairing for this user
  return null
}

export async function inviteCouplePartner(_userId: string, _partnerEmail: string): Promise<
  { error: string } | { ok: true; inviteId: string }
> {
  // TODO(Phase 6): create pending couple invite + notify partner
  return { error: 'Couple sharing is not implemented yet (reserved for Phase 6+).' }
}

export async function listSharedAlbums(_coupleId: string): Promise<SharedAlbum[]> {
  // TODO(Phase 6): query shared_albums table
  return []
}

export async function addPhotoToSharedAlbum(_albumId: string, _photoId: string): Promise<
  { error: string } | { ok: true }
> {
  // TODO(Phase 6): insert into shared_album_photos
  return { error: 'Shared album writes are not implemented yet (reserved for Phase 6+).' }
}
