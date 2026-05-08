import { supabase } from '../lib/supabaseClient'
import type { DbPhoto } from '../types/database'
import type { PhotoVisibility } from '../types/photo'

const BUCKET = 'photos'
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// ── Validation ────────────────────────────────────────────────────────────────

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return '只支持 JPG、PNG、WebP 格式'
  if (file.size > MAX_SIZE_BYTES) return '照片大小不能超过 10MB'
  return null
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadPhotoFile(
  userId: string,
  file: File
): Promise<{ filePath: string } | { error: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const filePath = `${userId}/${unique}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }
  return { filePath }
}

// Batch create signed URLs (1-hour expiry). Returns Map<filePath, signedUrl>
export async function createSignedUrls(filePaths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (filePaths.length === 0) return map

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(filePaths, 3600)

  if (error || !data) return map
  for (const item of data) {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl)
  }
  return map
}

export async function deleteStorageFile(filePath: string): Promise<string | null> {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  return error ? error.message : null
}

// ── Database ──────────────────────────────────────────────────────────────────

export interface SavePhotoInput {
  userId: string
  filePath: string
  fileName: string
  title?: string
  countryId: string
  cityId?: string
  landmarkId?: string
  takenDate: string
  takenTime?: string
  notes?: string
  tags?: string[]
  visibility?: PhotoVisibility
}

export async function savePhotoMetadata(
  input: SavePhotoInput
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id: input.userId,
      file_path: input.filePath,
      file_url: input.filePath, // path stored; signed URL generated on read
      file_name: input.fileName,
      title: input.title ?? null,
      country_id: input.countryId,
      city_id: input.cityId ?? null,
      landmark_id: input.landmarkId ?? null,
      taken_date: input.takenDate,
      taken_time: input.takenTime ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: data.id }
}

export async function getUserPhotos(userId: string): Promise<DbPhoto[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('taken_date', { ascending: false })

  if (error) return []
  return (data as DbPhoto[]) ?? []
}

export async function deletePhotoRecord(photoId: string): Promise<string | null> {
  const { error } = await supabase.from('photos').delete().eq('id', photoId)
  return error ? error.message : null
}

// Full delete: Storage file + DB record (Storage first; if it fails, abort)
export async function deletePhoto(
  photoId: string,
  filePath: string
): Promise<{ error: string | null }> {
  const storageErr = await deleteStorageFile(filePath)
  if (storageErr) return { error: storageErr }
  const dbErr = await deletePhotoRecord(photoId)
  return { error: dbErr }
}

// Batch delete all photos for a city.
// Tries to remove every Storage file, then deletes all DB records.
// Storage errors are collected and returned; DB deletion proceeds regardless.
export async function deletePhotosByCityId(
  photos: { id: string; file_path: string }[]
): Promise<{ storageErrors: string[] }> {
  const storageErrors: string[] = []

  for (const p of photos) {
    const err = await deleteStorageFile(p.file_path)
    if (err) storageErrors.push(`${p.file_path}: ${err}`)
  }

  if (photos.length > 0) {
    const ids = photos.map((p) => p.id)
    await supabase.from('photos').delete().in('id', ids)
  }

  return { storageErrors }
}
