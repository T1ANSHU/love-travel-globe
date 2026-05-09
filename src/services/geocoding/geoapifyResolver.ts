/**
 * GeoapifyResolver — active; wired as Step 2 in PlaceResolverChain (placeResolver.ts).
 *
 * Requirements:
 *   1. Set VITE_GEOAPIFY_API_KEY in .env.local (get key at geoapify.com).
 *   2. In Geoapify dashboard → set HTTP Referrer to your production domain.
 *
 * Security model:
 *   Geoapify is a client-side geocoding API (same model as Mapbox / HERE).
 *   The key is intentionally placed in the browser bundle via VITE_ prefix.
 *   HTTP Referrer restriction limits it to your domain, so a leaked key has
 *   negligible risk on the free tier (3,000 req/day hard cap).
 *   No serverless proxy is required for this app's scale.
 *
 * Provider comparison (why Geoapify over OpenCage):
 *   - Free tier: 3,000 req/day (Geoapify) vs 2,500 req/day (OpenCage)
 *   - result_type field cleanly maps to PlaceType ('city' | 'country')
 *   - Good Chinese city name support via lang=zh parameter
 *   - Structured address components match ResolvedPlace fields directly
 */

import type { PlaceResult, IPlaceResolver, ResolvedPlace } from '../../types/place'

// ── Geoapify API response types ───────────────────────────────────────────────
// Exported so callers (e.g. a future SupabaseCacheResolver) can reference them.
// Subset of fields returned by /v1/geocode/search — only what we need.

export interface GeoapifyProperties {
  name?: string
  city?: string
  town?: string
  county?: string
  country: string
  country_code: string            // ISO 3166-1 alpha-2, lowercase e.g. "de"
  state?: string
  result_type: 'city' | 'county' | 'state' | 'country' | 'amenity' | 'street' | 'postcode'
  formatted: string               // e.g. "Munich, Bavaria, Germany"
  lat: number
  lon: number
  place_id: string
}

export interface GeoapifyFeature {
  type: 'Feature'
  properties: GeoapifyProperties
  geometry: {
    type: 'Point'
    coordinates: [number, number]  // [lng, lat]
  }
}

export interface GeoapifyResponse {
  type: 'FeatureCollection'
  features: GeoapifyFeature[]
}

// ── Resolver ──────────────────────────────────────────────────────────────────

const UNSUPPORTED_MESSAGE = '当前地点暂未收录，后续将支持全球城市自动定位。'

// result_type values we consider meaningful place results (exclude street, postcode, amenity)
const VALID_TYPES = new Set(['city', 'county', 'state', 'country'])

const GEO_API = 'https://api.geoapify.com/v1/geocode/search'

/** Implements IPlaceResolver using the Geoapify Geocoding API. */
export class GeoapifyResolver implements IPlaceResolver {
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /** Returns up to `limit` place candidates from Geoapify. Empty array on any error or missing key. */
  async resolveMany(query: string, limit = 5): Promise<ResolvedPlace[]> {
    const q = query.trim()
    if (!q || !this.apiKey) return []

    const params = new URLSearchParams({
      text: q,
      lang: 'en',
      limit: String(limit),
      apiKey: this.apiKey,
    })

    try {
      const res = await fetch(`${GEO_API}?${params}`)
      if (!res.ok) return []
      const data: GeoapifyResponse = await res.json()
      return data.features
        .filter((f) => VALID_TYPES.has(f.properties.result_type))
        .map((f) => this.featureToPlace(q, f))
    } catch {
      return []
    }
  }

  async resolve(query: string): Promise<PlaceResult> {
    const q = query.trim()
    if (!q || !this.apiKey) {
      return { found: false, query: q, message: UNSUPPORTED_MESSAGE }
    }
    const candidates = await this.resolveMany(q, 1)
    return candidates[0] ?? { found: false, query: q, message: UNSUPPORTED_MESSAGE }
  }

  featureToPlace(query: string, f: GeoapifyFeature): ResolvedPlace {
    const p = f.properties
    const countryId = p.country_code.toUpperCase()   // "de" → "DE"
    const placeName = p.city ?? p.town ?? p.county ?? p.name ?? query
    const type = p.result_type === 'country' ? 'country' : 'city'

    return {
      found: true,
      type,
      id: p.place_id,                    // Geoapify place_id — no local city id equivalent
      displayName: placeName,
      displayNameEn: placeName,          // lang=en means both fields get English names
      countryId,
      countryName: p.country,
      lat: p.lat,
      lng: p.lon,
      cityId: type === 'city' ? p.place_id : undefined,
      source: 'geocoding_api',
    }
  }
}
