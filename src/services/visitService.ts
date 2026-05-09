import { supabase } from '../lib/supabaseClient'
import type { DbUserPlace } from '../types/database'

export async function getUserPlaces(userId: string): Promise<DbUserPlace[]> {
  const { data, error } = await supabase
    .from('user_places')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addUserPlace(
  userId: string,
  input: {
    placeType: 'country' | 'city' | 'landmark'
    countryId: string
    cityId?: string | null
    landmarkId?: string | null
    // Geocoding fields — omit for local places (defaults to 'local' / NULL in DB)
    placeSource?: 'local' | 'geocoding_api'
    displayName?: string | null
    nameEn?: string | null
    countryName?: string | null
    lat?: number | null
    lng?: number | null
  },
): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase.from('user_places').insert({
    user_id: userId,
    place_type: input.placeType,
    country_id: input.countryId,
    city_id: input.cityId ?? null,
    landmark_id: input.landmarkId ?? null,
    visited: false,
    place_source: input.placeSource ?? 'local',
    display_name: input.displayName ?? null,
    name_en: input.nameEn ?? null,
    country_name: input.countryName ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  })
  if (error) {
    // Unique constraint violation = place already exists, treat as success
    if (error.code === '23505') return { ok: true }
    return { error: error.message }
  }
  return { ok: true }
}

export async function deleteUserPlaceByCity(
  userId: string,
  cityId: string,
): Promise<string | null> {
  const { error } = await supabase
    .from('user_places')
    .delete()
    .eq('user_id', userId)
    .eq('city_id', cityId)
    .eq('place_type', 'city')
  return error ? error.message : null
}

// Stubs kept for future use
export async function getVisitRecords(_userId: string) {
  return []
}

export async function markPlaceVisited(
  _userId: string,
  _input: {
    placeType: 'country' | 'city' | 'landmark'
    countryId: string
    cityId?: string | null
    landmarkId?: string | null
    firstVisitDate?: string
  },
): Promise<{ ok: true } | { error: string }> {
  return { ok: true }
}
