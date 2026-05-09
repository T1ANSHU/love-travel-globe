# Project Progress

Last updated: 2026-05-10 (Global Place Location System / Geoapify complete on main — UI Polish experiments on `ui-polish-experiments` branch)

## Completed

### Phase 1 — Auth & Foundation
- Supabase project wired up (`.env.local`, `supabaseClient.ts`)
- Register / Login / Logout with Supabase Auth
- `ProtectedRoute` — unauthenticated users redirected to `/login`
- Pink dreamy UI on auth pages (`AuthPage`, `LoginForm`, `RegisterForm`)
- `siteConfig.ts` for unified site metadata
- `AuthorCredit` component (reusable, pink-500, text-shadow)
- TypeScript types: `travel.ts`, `database.ts`, `photo.ts`
- Public map data: `countries.ts`, `cities.ts`, `landmarks.ts`
- Supabase SQL: 6 tables + full RLS (`supabase/schema.sql`, `supabase/storage.sql`)
  - `place_key` GENERATED ALWAYS AS column for reliable UNIQUE on nullable fields

### Phase 2 — 3D Globe
- `GlobeScene` using globe.gl v2.45.3 + Three.js
- Transparent WebGL canvas over pink CSS background
- Pink atmosphere (`#f9a8d4`, altitude 0.18)
- City pink dots via `pointsData`
- Glass-card HTML labels for global-level landmarks via `htmlElementsData`
- Auto-rotation, drag, zoom with OrbitControls
- Camera altitude tracked in `globeStore`

### Phase 3 — Photo Upload & Album
- `photoService.ts`: upload to Supabase Storage, save metadata, batch signed URLs, delete
- `photoStore.ts`: Zustand cache with `PhotoWithUrl` (photo + displayUrl)
- `useUserPhotos` hook: fetches on mount, exposes `refetch`
- `usePhotoUpload` hook: validate → upload → save metadata
- `AlbumModal`: two views — `album` (photo grid) and `upload` (form)
- `UploadPhotoForm`: React Hook Form + Zod, cascading country→city→landmark dropdowns
- `PhotoGrid` / `PhotoCard`: signed-URL image display, empty-state illustration
- `PhotoPreview`: full-screen keyboard nav (←→Esc), delete with Storage+DB cleanup
- City click on globe → opens `AlbumModal` for that city
- Sidebar: real stats (countries / cities / photos count via Set), "📷 上传照片" button
- `GlobePage`: seeds photo cache on mount via `useUserPhotos`

### Phase 3 Interaction Fix — Globe Marker Sync & Hover Jitter
- **Root cause 1 (lag)**: `htmlTransitionDuration` default 800ms + `pointsTransitionDuration` default 1000ms caused markers to animate into position instead of tracking instantly
- **Fix**: set both to `0` → markers now stick to globe surface in real time
- **Root cause 2 (hover jitter)**: changing outer wrapper `transform` (adding scale) while globe.gl updates `left`/`top` each frame caused CSS conflict
- **Fix**: outer wrapper transform is never mutated; scale effect lives on inner element only
- Drag-vs-click detection (>5px threshold) prevents album opening on drag
- `onPointHover` / label `mouseenter` pause auto-rotation; resume after 1.5s delay on leave

### Phase 4 — Sidebar Features, Music & Sound Infrastructure
- **Search**: enabled search input in sidebar, fuzzy matches CITIES + COUNTRIES by Chinese/English name; click result → globe flies to that location (city: altitude 1.0, country: altitude 1.6)
- **Filters** (`FilterPanel`): collapsible panel with year chips, country dropdown, date range (two stacked rows), tag chips; active filter count badge; "清除全部筛选" button; filters persist in `photoStore.filters`
- **Stats** (`StatsPanel`): expanded to 5 items — countries visited, cities visited, total photos, earliest travel date, latest travel date
- **Globe controls** (`GlobeControlPanel`): auto-rotate toggle (saved to DB), one-click reset to global view
- **Background music** (`MusicPanel` + `audioService.ts`): play/pause toggle, volume slider (0–100); HTML Audio singleton with loop; infrastructure ready, audio files wired in UI Polish phase
- **Sound effects** (`audioService.ts`): on/off toggle, volume slider; `playSfx(name)` hooks called at city-hover, city-click, album-open, album-close, upload-success, photo-delete; silent no-op until audio files are added
- **Settings persistence** (`settingsService.ts` + `settingsStore.ts`): auto-rotate, music enabled/volume, sfx enabled/volume saved to `user_settings` Supabase table; loaded on mount via `useSettings()`; saves debounced 600ms
- **"所有相册" button**: new entry point in sidebar; opens `AlbumModal` with `place=null` in album view; respects active filters (筛选 → 所有相册 shows filtered results)
- **Fly-to mechanism** (`globeStore.flyToRequest`): store-based, Zustand subscribe (zero React re-renders), animates globe camera over 1200ms
- **Bug fix — search dropdown z-index**: moved dropdown outside GlassCard; outer wrapper `z-10` creates stacking context above FilterPanel's `backdrop-filter` stacking context (z-auto = 0)
- **Bug fix — date input overflow**: changed date range layout from horizontal flex to two full-width stacked rows

### Phase 5 — Travel Timeline, Route Playback & Map Enhancements

#### Core features
- **Visited city / country highlight**: `visitedCityIds` / `visitedCountryIds` computed from photoStore; city points turn bright pink (`#ec4899`) and grow (`radius 0.85`) when visited; country dot turns soft pink (`#fbcfe8`) when any photo in that country exists
- **Route arcs toggle** (`GlobeControlPanel` + `globeStore.showArcs`): draws travel path arcs sorted by photo date; `buildArcs()` deduplicates consecutive same-city stays
- **Travel timeline** (`TimelinePanel`): groups photos by date + city/country; clicking an entry flies globe to that location; format "中国 — 北京" (country — city)
- **Route playback** (`ReplayPanel` + `useReplay` + `replayStore`): play/pause/stop controls, speed selector (0.5×/1×/2×), progress bar, current city display; flies globe to each stop on a timer
- **Replay arc highlight**: active arc turns full-opacity rose (`rgba(244,63,94,1)`), thicker stroke (`0.9`), faster dash animation (`700ms`); other arcs dim to 25% opacity; current city point pulses vivid deep rose (`#f43f5e`) and enlarges (`radius 1.2`)
- **Photo upload visibility selector** (`UploadPhotoForm`): private / shared / public; shared & public are reserved for future multi-user sharing — currently all photos are private-only
- **All-album photo cards**: `PhotoGrid` now shows country · city · date overlay on every photo card
- **Expanded map data**: added cities, countries, and landmarks for CN / JP / FR / AU / GB / US / IT / TH / SG / KR

#### Bug fixes (Phase 5 session)
- **Canonical city_id unification**: landmarks.ts now carries `cityId: 'CN-beijing'` (capital-prefixed); `buildLabelElement` uses `lm.cityId ?? lm.id`; label clicks and point clicks now call `openPlace` with identical `city_id`. `getCityById` made case-insensitive to handle legacy lowercase IDs stored before the fix
- **visitedCityIds normalization**: `buildArcs`, `buildCitySequence`, `useReplaySequence`, and the visited-sets recompute all store/compare canonical `city.id` (not raw `p.city_id`), so old lowercase data does not break point highlights or replay
- **TimelinePanel "中国 — 北京" fix**: previously showed "中国 — 中国" when `getCityById` failed on lowercase IDs; fixed by case-insensitive lookup + format change to `` `${countryName} — ${placeName}` ``
- **Route arc z-fighting / clipping fix**: replaced `arcAltitudeAutoScale(0.4)` (gave ~0.033 for Shanghai→Chengdu, causing arcs to sink into globe) with `arcAltitude(arcAltitudeCallback)` — distance-based formula `max(0.065, angularDist/π × 0.38)`; floor `0.065` is safely above the sphere surface for all city pairs
- **Arc jitter fix**: `useGlobeStore.subscribe` previously subscribed to all store changes including `cameraAltitude`; every drag/zoom triggered `buildArcs() + g.arcsData()` re-bind causing per-frame flicker; changed to selective subscription `(state, prev) => { if (state.showArcs !== prev.showArcs) rebuildArcs() }` — arcsData is now only rebuilt when the toggle changes or photos change
- **Final arc height tuning**: floor `0.065`, scale `0.38`; short regional routes (Beijing–Shanghai, Shanghai–Chengdu) show as low natural arcs; long intercontinental routes rise to ~0.15–0.22; no z-fighting confirmed by manual test

### Phase 5.5 Step 1 — Place System Redesign (capitals + user_places + delete city)

#### Globe marker visibility redesign
- Globe now shows only capital cities by default on first load
- Non-capital cities appear only when: (a) user has uploaded at least one photo there, or (b) user has manually added the city via "添加国家 / 城市"
- `CAPITAL_CITY_IDS` constant (module-level `Set`) drives the default visible set
- `recomputeVisible()` runs on mount and re-runs whenever `photoStore.photos` or `placeStore.userAddedCityIds / userAddedCountryIds` changes — uses selective Zustand `subscribe` to avoid firing on camera moves
- Adding a country via the UI automatically surfaces its capital city

#### Add country / city feature
- `user_places` Supabase table records user-manually-added places (`place_type = 'city' | 'country'`); `place_key` GENERATED column enforces `UNIQUE(user_id, place_key)`
- `placeStore.ts` (Zustand): `userAddedCityIds`, `userAddedCountryIds`, `fetchUserPlaces`, `addCity`, `addCountry`
- `useUserPlaces` hook: fetches on mount when user is authenticated
- `AddPlaceModal`: search UI over COUNTRIES + CITIES by Chinese/English name; shows "已添加" state; warns when country has no capital in dataset; results capped at 20
- Sidebar "我的地点" card with "📍 添加国家 / 城市" entry point
- Idempotent inserts: Supabase unique-constraint violation (`23505`) treated as success

#### Delete city feature
- Delete button at bottom of city `AlbumModal` (album view only, below photo count); styled in rose, separated by border, not easily mis-clicked
- Confirmation modal (`DeleteCityConfirmModal`) shows: city name, country name, photo count; explicit warning "此操作不可恢复"
- On confirm, deletes in order:
  1. Supabase Storage `photos` bucket files (one by one, errors collected and displayed — does not silently fail)
  2. `photos` table records (bulk delete by ID)
  3. `user_places` city record for this user
  4. `photoStore.removePhotos()` updates local cache
  5. `placeStore.removeCityId()` removes from `userAddedCityIds`
- Globe marker re-evaluation fires automatically via `recomputeVisible` subscription:
  - Non-capital city with no remaining photos and not manually added → marker disappears
  - Capital city → marker stays (always in `CAPITAL_CITY_IDS`), returns to default unvisited style
- TimelinePanel, ReplayPanel, StatsPanel, all-album view all update automatically (subscribe to `photoStore.photos`)

#### UX fixes
- Drag-to-select text bug fixed: `select-none` on `GlobePage` outermost div + `user-select: none` on city label `inner` element
- Form inputs (`<input>`, `<textarea>`) are unaffected by parent `user-select: none` (browser default behaviour)
- `npm run build` passes, TypeScript zero errors

### Phase 5.5 Step 2 — City Hover Photo Preview

- `CityHoverPreview.tsx` (new): independent overlay component, sibling of `GlobeScene` in GlobePage — re-renders never affect GlobeScene or arcs
- `hoveredCity: { cityId, x, y } | null` added to `globeStore`; `GlobeScene` now uses **selective subscriptions** (`s => s.autoRotate` only) so hover state changes do not trigger GlobeScene re-renders
- `currentMouseX / currentMouseY` module-level vars in `GlobeScene` track cursor position via `mousemove` listener; cleared on `mouseleave`
- Label `mouseenter`/`mouseleave` and `onPointHover` call `useGlobeStore.getState().setHoveredCity()` imperatively — zero React re-renders from these callbacks
- No photos → shows "还没有照片 / 点击添加回忆" pill with glass card
- One photo → single thumbnail with rounded corners and shadow
- Multiple photos (≤3) → offset/rotated stack: photo[0] front `rotate(3deg)`, photo[1] behind-left `translate(-10px,6px) rotate(-8deg)`, photo[2] behind-right `translate(14px,8px) rotate(9deg)`; each has `border-radius: 8px` and `box-shadow`
- Hint text ("N 张照片 · 点击查看全部") floats below as a semi-transparent pill — no glass card box around photos
- `pointer-events: none` on overlay — does not interfere with globe clicks
- Click behaviour unchanged: city labels and points still open full `AlbumModal`
- `npm run build` passes, TypeScript zero errors

### Phase 5.5 Step 3 — Add-Place Achievement Animation

- `PlaceAchievement.tsx` (new): exports `AchievementPlace` interface + `PlaceAchievement` component
- `achievementPlace` state is **local to `GlobePage`** (not in globeStore) — no Zustand subscriber changes, no pointsData/arcsData re-binding
- `AddPlaceModal` gains `onPlaceAdded?: (place: AchievementPlace) => void` prop; on successful new add: immediately calls `onClose()` then `onPlaceAdded()` — React 18 batches both state updates into one render, so modal disappears and achievement starts in the same frame
- Failure path: `'error' in res` → neither `onClose` nor `onPlaceAdded` is called; modal stays open
- Duplicate add: button is disabled (`isAdded` check) before `handleAdd` is reached — achievement never fires for already-added places
- **Top achievement toast** (`z-[80]`, above all modals): game-achievement style glass card; slides in from top (`y: -24 → 0`), dwells ~2.2 s, fades out; shows icon + label ("新城市解锁！" / "首都城市解锁！" / "新国家解锁！") + title
- **Centre ambient text** (`z-[15]`, above globe, below sidebar/modals): city/country name in warm-white with golden glow text-shadow; `scale: 0.88 → 1.0` entrance, slow fade out with slight scale-up `→ 1.06`; subtitle chosen deterministically from 4-entry array
- Both layers share a 3.4 s Framer Motion keyframe timeline (`times: [0, 0.14, 0.76, 1]`); `onComplete` fires at 3.55 s, component unmounts cleanly (already invisible)
- `PlaceAchievement` keyed by `kind-name` so rapid successive adds each remount with a fresh timer
- `npm run build` passes, TypeScript zero errors

### Phase 6 Step 1 — Dynamic Photo Tag Filtering

- `FilterPanel` tag chips are now derived dynamically from `photoStore.photos` via `photos.flatMap((p) => p.tags)` → dedup → sort; no hardcoded tags
- Tags appear automatically in the filter bar after a user uploads a photo with tags; section is hidden when no tags exist
- Multi-select tag filtering supported: each chip toggles its tag in `filters.tags[]`; filter logic uses OR semantics (photo passes if it contains **any** selected tag)
- "清除全部筛选" resets `filters.tags` to `[]` along with all other filters
- Null-safety guard added in `photoStore.fetchPhotos`: `tags: Array.isArray(p.tags) ? p.tags : []` — prevents crashes from legacy DB rows or unexpected nulls
- No new Supabase queries; tag data is entirely derived from the already-loaded photos cache
- Files changed: `src/store/photoStore.ts` (1 line added in `fetchPhotos` mapping)
- `npm run build` passes, TypeScript zero errors
- Manually verified: upload photo with tags → chips appear; click chip → filters correctly; multi-select works; clear works; all albums / city albums / timeline / replay unaffected

### Phase 6 Step 2 — City Memory Card (Travel Summary)

- City `AlbumModal` (album view only) now shows a travel summary row directly below the header
- Summary displays: earliest photo date, latest photo date, total photo count for that city
- Single-date format: `2024.01.10 · 3 张照片`
- Multi-date format: `2024.01.10 – 2024.01.15 · 12 张照片`
- No photos → summary row is not rendered; empty state UI unchanged
- Date range derived entirely from `photos` already filtered to the city (YYYY-MM-DD string sort = correct date order); no Date objects needed
- No new Supabase queries; no changes to photoStore, photoService, or schema
- Files changed: `src/components/Album/AlbumModal.tsx` only — added `fmtDate()` helper + `travelSummary` useMemo + summary row JSX
- `npm run build` passes, TypeScript zero errors
- Manually verified: multi-date range, single-date, no-photo cases; summary updates live after upload/delete; all albums / filters / tag filter / hover preview / add city / delete city / timeline / replay unaffected

### Phase 6 Step 3 — Vercel Deployment

- `vercel.json` created at project root with SPA rewrite: all routes fall back to `index.html`; `/login`, `/globe` and any other client-side routes no longer 404 on refresh
- `npm run build` (`tsc -b && vite build`) passes, TypeScript zero errors
- `.env` / `.env.local` confirmed absent from git (covered by `.gitignore`); `.env.example` with placeholder values is the only committed env file
- Frontend exclusively uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via `import.meta.env`; zero occurrences of `service_role` / `secret_key` in source
- Vercel deployment configuration confirmed:
  - Framework Preset: **Vite**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (set in Vercel dashboard, never committed)
- Files changed: `vercel.json` (new file only)
- Production smoke test passed:
  - Unauthenticated → redirects to `/login`; refresh `/login` → no 404
  - Register + login → enters globe with IntroAnimation
  - Globe rotates, zooms, drags correctly
  - Add city / country → marker appears, achievement animation plays
  - Upload photo → appears in album; refresh → data persists (Supabase cloud)
  - Tag filtering, timeline, replay, hover preview, city memory card all normal
  - Logout → redirects to `/login`
- **Production deployment manually verified by user**:
  - Production Vercel URL opens correctly
  - Login / register flow confirmed working in production
  - Auth redirect (Supabase Auth Site URL + Redirect URLs) confirmed — no 404
  - Globe page loads after login in production
  - Photo upload confirmed working in production
  - Data persists after page refresh in production
  - Supabase environment variables correctly configured on Vercel

### Post-Launch Enhancement — Global Place Location System (Geoapify)

> Merged to `main`. Verified in production.

**Purpose**: Allow users to add any city in the world, not just cities in the local static dataset (`cities.ts`).

#### Features shipped

- **Geoapify geocoding integration** (`src/services/geocoding/geoapifyResolver.ts`): `resolveMany(query, limit)` fetches Geoapify Places API, filters to `city/county/state/country` result types, returns `ResolvedPlace[]`; `VITE_GEOAPIFY_API_KEY` env var; zero fallback to stub
- **PlaceResolverChain** (`src/services/placeResolver.ts`): chains `LocalPlaceResolver → GeoapifyResolver`; exports `resolvePlaceCandidates(query)` for AddPlaceModal UI
- **Global search in AddPlaceModal**: after local results, shows dashed "搜索全球更多结果" button; clicking triggers Geoapify fetch with 500ms debounce; results deduplicated against local hits via `countryId:nameEn.toLowerCase()` key; "🌐 全球定位" badge on each Geoapify card; already-added detection via `userAddedCityIds`
- **Geocoded cities on globe**: `geocodedPlaces: Map<string, ResolvedPlace>` in placeStore feeds into `recomputeVisible()` — geocoded cities render as pink dots (`pointsData`) with HTML labels (`htmlElementsData`) identically to local cities
- **Zoom-aware label visibility**: capitals always labeled; non-capital city labels hidden when camera altitude ≥ 1.5; crossing the threshold triggers `recomputeVisible()` once via `onZoom` callback (no per-frame rebuild); geocoded cities follow the same threshold rule
- **Persistence after refresh**: 6 new columns added to `user_places` (`place_source`, `display_name`, `name_en`, `country_name`, `lat`, `lng`); Migration M001 SQL block in `supabase/schema.sql`; `fetchUserPlaces` reconstructs `ResolvedPlace` from DB fields when `place_source = 'geocoding_api'` and `getCityById` returns undefined
- **Immediate delete**: `removeCityId()` now also evicts from `geocodedPlaces` in the same Zustand `set()` call — globe marker and label disappear without refresh
- **Sidebar search includes geocoded cities**: `SearchPanel` queries `geocodedPlaces.values()` filtered by query match, deduped against local static results, merged into results list (max 8 total)
- **Fly-to for geocoded cities**: `setFlyToRequest({ lat, lng, altitude: 1.0 })` works identically — already lat/lng based, no static lookup needed

#### Schema change (Migration M001)

```sql
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS place_source TEXT DEFAULT 'local';
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS name_en      TEXT;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS country_name TEXT;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS lat          DOUBLE PRECISION;
ALTER TABLE user_places ADD COLUMN IF NOT EXISTS lng          DOUBLE PRECISION;
```

Run in Supabase SQL Editor on any existing installation. Safe to re-run (`IF NOT EXISTS`).

#### Future improvements (not yet implemented)

- Add `place_cache` table to cache Geoapify results server-side and reduce API calls
- Improve Chinese alias handling (e.g. 慕尼黑 → Munich) for cities with no Chinese name in Geoapify response
- Better cross-source duplicate detection for edge cases (same city returned by both local data and Geoapify)

#### Files changed (main branch)

- `src/services/geocoding/geoapifyResolver.ts` — real implementation (replaced stub)
- `src/services/placeResolver.ts` — wired GeoapifyResolver into chain; added `resolvePlaceCandidates()`
- `src/store/placeStore.ts` — added `geocodedPlaces`, `addGeocodedPlace`, extended `fetchUserPlaces` + `removeCityId`
- `src/services/visitService.ts` — extended `addUserPlace` input with 6 geocoding fields
- `src/types/database.ts` — extended `DbUserPlace` with 6 nullable fields
- `supabase/schema.sql` — added columns to `CREATE TABLE` block + Migration M001 at end
- `src/components/Globe/GlobeScene.tsx` — module-level `recomputeVisible()`, zoom threshold logic, geocoded rendering
- `src/components/Globe/AddPlaceModal.tsx` — Geoapify candidates UI, debounce, dedup, "搜索全球更多结果" button
- `src/components/Sidebar/SearchPanel.tsx` — geocodedPlaces search merged into results

#### Production verification

- Add Hamburg (not in local dataset) → marker + label appears on globe
- Refresh → Hamburg persists
- Delete Hamburg → disappears immediately from globe
- Sidebar search "Hamburg" → result found, click → camera flies to Hamburg
- Zoom in → non-capital labels appear; zoom out → hide; capitals always visible
- `npm run build` passes, TypeScript zero errors

---

## UI Polish — In Progress (branch: `ui-polish-experiments`)

> Work below is experimental. Not yet merged to main. Do not treat as finalized.

### Experiment 01 — Magic UI Particles on Auth Pages

**Status**: `[ in progress — needs visual tuning ]`
**Branch**: `ui-polish-experiments`
**Reference**: Magic UI Particles (magicui.design/docs/components/particles)

**Files added / modified:**
- `src/components/UI/ParticlesBackground.tsx` — new; self-contained canvas particle engine adapted from Magic UI (MIT); exports `Particles` core component + `ParticlesBackground` convenience wrapper
- `src/components/Auth/LoginPage.tsx` — added `<ParticlesBackground />` as first child (behind blobs and card)
- `src/components/Auth/RegisterPage.tsx` — same, in both main view and post-registration success view

**Current particle configuration (two-layer):**

| Layer | quantity | color | size (base px) | staticity | ease |
|---|---|---|---|---|---|
| A — rose | 80 | `#f9a8d4` pink-300 | 1.4 (range 1.4–3.4) | 70 | 85 |
| B — white | 55 | `#ffffff` | 0.9 (range 0.9–2.9) | 60 | 90 |
| **Total** | **135** | — | — | — | — |

**What works:**
- Particles render on login and register pages only
- `pointer-events: none`, `z-0` — never blocks cards, inputs, or buttons
- GlobePage and all Phase 1–6 features completely unaffected
- `npm run build` passes, TypeScript zero errors

**Known issue / next improvement:**
- Particles are still too subtle on the soft pink background — individual dots are hard to distinguish from the existing blur blobs
- Next session: increase quantity further (120–160 total), increase `size` to 1.8–2.4 base, consider raising alpha ceiling (currently max 0.7 in core engine), add slight warm-white glow effect, strengthen mouse-interaction response

**Not yet done:**
- Not merged to main
- Not deployed to production

## Not Started

- **Audio Polish**: city/country unlock sound effect — sacred, ethereal, soft chime, magical, calm, dreamy; should play in sync with achievement animation; deferred until `MusicPanel` / `audioService` / audio asset management are finalised
- Remaining UI Polish modules (see `docs/UI_POLISH_PLAN.md` and `docs/UI_POLISH_BACKLOG.md`)
