/**
 * Centralized place resolution service.
 *
 * Architecture — three-step chain (only Step 1 implemented):
 *
 *   Step 1 — LocalPlaceResolver (this file)
 *     Searches CITIES / COUNTRIES / LANDMARKS by id, zh name, en name.
 *     Synchronous, zero network, instant response.
 *
 *   Step 2 — GeoapifyResolver (stub ready, not yet wired)
 *     File: src/services/geocoding/geoapifyResolver.ts
 *     To enable: set VITE_GEOAPIFY_API_KEY, uncomment the fetch block in the
 *     stub, then uncomment the line in the chain array below.
 *     Env var: VITE_GEOAPIFY_API_KEY (browser-safe; set Referrer restriction in dashboard)
 *
 *   Step 3 — SupabaseCacheResolver (future, not yet added)
 *     Check place_cache table first; write-through on every new Geoapify hit.
 *     SQL (do not apply yet):
 *       CREATE TABLE place_cache (
 *         query_normalized  TEXT PRIMARY KEY,
 *         result            JSONB NOT NULL,
 *         provider          TEXT NOT NULL,
 *         resolved_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
 *         expires_at        TIMESTAMPTZ
 *       );
 *       ALTER TABLE place_cache ENABLE ROW LEVEL SECURITY;
 *       CREATE POLICY "place_cache_select" ON place_cache FOR SELECT TO authenticated USING (true);
 *       CREATE POLICY "place_cache_insert" ON place_cache FOR INSERT TO authenticated WITH CHECK (true);
 *
 * To add a new resolver, implement IPlaceResolver and append to the chain array
 * at the bottom of this file — no other code needs to change.
 */

import type { PlaceResult, IPlaceResolver, ResolvedPlace } from '../types/place'
import type { BaseCity, BaseCountry, BaseLandmark } from '../types/travel'
import { CITIES } from '../data/cities'
import { COUNTRIES } from '../data/countries'
import { LANDMARKS } from '../data/landmarks'

// ── Shared helpers ────────────────────────────────────────────────────────────

const UNSUPPORTED_MESSAGE =
  '当前地点暂未收录，后续将支持全球城市自动定位。'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

// Pre-built lookup maps — constructed once at module load, O(1) access
const countryById  = new Map(COUNTRIES.map((c) => [c.id.toLowerCase(), c]))
const cityById     = new Map(CITIES.map((c) => [c.id.toLowerCase(), c]))
const landmarkById = new Map(LANDMARKS.map((l) => [l.id.toLowerCase(), l]))

const countryNames = new Map(COUNTRIES.map((c) => [c.id, { zh: c.name, en: c.nameEn }]))

// ── Helpers that turn data rows into ResolvedPlace ────────────────────────────

function fromCity(c: BaseCity): ResolvedPlace {
  const cn = countryNames.get(c.countryId)
  return {
    found: true,
    type: 'city',
    id: c.id,
    displayName: c.name,
    displayNameEn: c.nameEn,
    countryId: c.countryId,
    countryName: cn?.zh ?? c.countryId,
    lat: c.lat,
    lng: c.lng,
    cityId: c.id,
    isCapital: c.isCapital,
    source: 'local',
  }
}

function fromCountry(c: BaseCountry): ResolvedPlace {
  return {
    found: true,
    type: 'country',
    id: c.id,
    displayName: c.name,
    displayNameEn: c.nameEn,
    countryId: c.id,
    countryName: c.name,
    lat: c.centerLat,
    lng: c.centerLng,
    source: 'local',
  }
}

function fromLandmark(l: BaseLandmark): ResolvedPlace {
  const cn = countryNames.get(l.countryId)
  return {
    found: true,
    type: 'landmark',
    id: l.id,
    displayName: l.name,
    displayNameEn: l.nameEn,
    countryId: l.countryId,
    countryName: cn?.zh ?? l.countryId,
    lat: l.lat,
    lng: l.lng,
    cityId: l.cityId,
    landmarkId: l.id,
    source: 'local',
  }
}

// ── Step 1: LocalPlaceResolver ────────────────────────────────────────────────

/**
 * Searches local static data in three passes:
 *   Pass 1 — exact id match              (fastest, used by internal lookups)
 *   Pass 2 — exact zh / en name match    (user typed the full name precisely)
 *   Pass 3 — substring zh / en match     (user typed a partial name)
 *
 * Priority within each pass: city > country > landmark
 * (Cities are the most common user-facing query target.)
 */
class LocalPlaceResolver implements IPlaceResolver {
  async resolve(query: string): Promise<PlaceResult> {
    const q = norm(query)
    if (!q) return { found: false, query, message: UNSUPPORTED_MESSAGE }

    // Pass 1 — exact id
    const c1 = cityById.get(q)
    if (c1) return fromCity(c1)

    const co1 = countryById.get(q)
    if (co1) return fromCountry(co1)

    const l1 = landmarkById.get(q)
    if (l1) return fromLandmark(l1)

    // Country code shortcut (e.g. "cn", "jp")
    const coByCode = COUNTRIES.find((c) => norm(c.code) === q)
    if (coByCode) return fromCountry(coByCode)

    // Pass 2 — exact name (full match, zh or en)
    const c2 = CITIES.find((c) => norm(c.name) === q || norm(c.nameEn) === q)
    if (c2) return fromCity(c2)

    const co2 = COUNTRIES.find((c) => norm(c.name) === q || norm(c.nameEn) === q)
    if (co2) return fromCountry(co2)

    const l2 = LANDMARKS.find((l) => norm(l.name) === q || norm(l.nameEn) === q)
    if (l2) return fromLandmark(l2)

    // Pass 3 — substring (partial match)
    const c3 = CITIES.find((c) => norm(c.name).includes(q) || norm(c.nameEn).includes(q))
    if (c3) return fromCity(c3)

    const co3 = COUNTRIES.find((c) => norm(c.name).includes(q) || norm(c.nameEn).includes(q))
    if (co3) return fromCountry(co3)

    const l3 = LANDMARKS.find((l) => norm(l.name).includes(q) || norm(l.nameEn).includes(q))
    if (l3) return fromLandmark(l3)

    return { found: false, query, message: UNSUPPORTED_MESSAGE }
  }
}

// ── Resolver chain ────────────────────────────────────────────────────────────

/**
 * Tries resolvers in order; returns the first found result.
 * If all resolvers return found:false, returns an UnsupportedPlace.
 *
 * Future usage:
 *   new PlaceResolverChain([
 *     new LocalPlaceResolver(),
 *     new GeoapifyResolver(process.env.GEOAPIFY_KEY),
 *     new SupabaseCacheResolver(),
 *   ])
 */
class PlaceResolverChain implements IPlaceResolver {
  private readonly resolvers: IPlaceResolver[]
  constructor(resolvers: IPlaceResolver[]) {
    this.resolvers = resolvers
  }

  async resolve(query: string): Promise<PlaceResult> {
    for (const r of this.resolvers) {
      const result = await r.resolve(query)
      if (result.found) return result
    }
    return { found: false, query: query.trim(), message: UNSUPPORTED_MESSAGE }
  }
}

// ── Singleton + public API ────────────────────────────────────────────────────

const _chain = new PlaceResolverChain([
  new LocalPlaceResolver(),
  // Step 2: import { GeoapifyResolver } from './geocoding/geoapifyResolver'
  // then uncomment ↓ (also uncomment the fetch block inside GeoapifyResolver.resolve)
  // new GeoapifyResolver(import.meta.env.VITE_GEOAPIFY_API_KEY ?? ''),
  // Step 3: new SupabaseCacheResolver(),
])

/**
 * Resolve any free-text query (city name, country name, landmark name, or id)
 * to a normalized PlaceResult.
 *
 * @example
 *   const result = await resolvePlace('北京')
 *   if (result.found) console.log(result.lat, result.lng)
 *   else console.log(result.message)
 */
export async function resolvePlace(query: string): Promise<PlaceResult> {
  return _chain.resolve(query)
}

/**
 * Direct ID lookup across all local datasets (city id, country id, landmark id).
 * Always synchronous and O(1). Returns null if id is not in local data.
 * Use this when you already have a database id and just need coordinates/names.
 */
export function resolvePlaceById(id: string): ResolvedPlace | null {
  const q = norm(id)
  const city = cityById.get(q)
  if (city) return fromCity(city)

  const country = countryById.get(q)
  if (country) return fromCountry(country)

  const landmark = landmarkById.get(q)
  if (landmark) return fromLandmark(landmark)

  return null
}
