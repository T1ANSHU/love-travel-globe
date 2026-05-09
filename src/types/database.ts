// Supabase row types — snake_case matching DB columns exactly

export interface DbProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DbUserPlace {
  id: string
  user_id: string
  place_type: 'country' | 'city' | 'landmark'
  country_id: string
  city_id: string | null
  landmark_id: string | null
  place_key: string
  // Geocoding source fields (NULL for local places)
  place_source: string | null       // 'local' | 'geocoding_api'
  display_name: string | null
  name_en: string | null
  country_name: string | null
  lat: number | null
  lng: number | null
  visited: boolean
  first_visit_date: string | null
  last_visit_date: string | null
  notes: string | null
  cover_photo_id: string | null
  created_at: string
  updated_at: string
}

export interface DbVisitRecord {
  id: string
  user_id: string
  country_id: string
  city_id: string | null
  landmark_id: string | null
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbPhoto {
  id: string
  user_id: string
  file_url: string
  file_path: string
  file_name: string
  title: string | null
  country_id: string
  city_id: string | null
  landmark_id: string | null
  taken_date: string
  taken_time: string | null
  uploaded_at: string
  notes: string | null
  tags: string[]
  visibility: 'private' | 'shared' | 'public'
  created_at: string
  updated_at: string
}

export interface DbAlbum {
  id: string
  user_id: string
  album_type: 'country' | 'city' | 'landmark' | 'custom'
  country_id: string | null
  city_id: string | null
  landmark_id: string | null
  title: string
  description: string | null
  cover_photo_id: string | null
  created_at: string
  updated_at: string
}

export interface DbUserSettings {
  id: string
  auto_rotate: boolean
  music_enabled: boolean
  sound_effects_enabled: boolean
  music_volume: number
  sfx_volume: number
  preferred_language: string
  created_at: string
  updated_at: string
}
