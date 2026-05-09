// Resolved place types for the centralized place resolution system.
// Three-step chain:
//   Step 1 (active): local CITIES / COUNTRIES / LANDMARKS static data
//   Step 2 (active): Geoapify geocoding API (GeoapifyResolver)
//   Step 3 (future): Supabase place_cache table for resolved results

export type PlaceType = 'city' | 'country' | 'landmark'

/** A successfully resolved place — regardless of which resolver found it. */
export interface ResolvedPlace {
  found: true
  type: PlaceType
  id: string
  displayName: string      // zh  e.g. "北京"
  displayNameEn: string    // en  e.g. "Beijing"
  countryId: string        // ISO-3166-1 alpha-2
  countryName: string      // zh  e.g. "中国"
  lat: number
  lng: number
  cityId?: string          // set for type='city' and type='landmark'
  landmarkId?: string      // set for type='landmark' only
  isCapital?: boolean      // set for type='city'
  source: 'local' | 'geocoding_api' | 'supabase_cache'
}

/** Returned when no resolver can identify the query. */
export interface UnsupportedPlace {
  found: false
  query: string
  message: string
}

export type PlaceResult = ResolvedPlace | UnsupportedPlace

/**
 * Resolver interface.
 * Every resolver (local, Geoapify, Supabase cache) implements this.
 * PlaceResolverChain tries them in order and returns the first found result.
 */
export interface IPlaceResolver {
  resolve(query: string): Promise<PlaceResult>
}
