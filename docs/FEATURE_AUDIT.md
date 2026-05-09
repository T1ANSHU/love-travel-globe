# Feature Audit — Love Travel Globe

**Date**: 2026-05-10
**Branch**: main
**Build status**: ✅ `npm run build` passes — TypeScript zero errors, Vite build succeeds
**Build note**: Single 2.57 MB chunk (gzip 735 KB). Vite warns about chunk size but it is not a breakage — acceptable for a globe-heavy SPA. Address with dynamic imports in a later polish pass if needed.

---

## Feature Checklist

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Auth and user session | ✅ Complete | |
| 2 | User data isolation (RLS) | ✅ Complete | |
| 3 | Photo upload and persistence | ✅ Complete | |
| 4 | Photo notes / captions | ✅ Complete | |
| 5 | Album modal | ✅ Complete | |
| 6 | City memory card | ✅ Complete | |
| 7 | Add local city / country | ✅ Complete | |
| 8 | Geoapify global city search | ✅ Complete | |
| 9 | Geoapify city persistence after refresh | ✅ Complete | |
| 10 | Geoapify city delete | ✅ Complete | |
| 11 | Sidebar search + camera focus | ✅ Complete | |
| 12 | Globe marker rendering | ✅ Complete | |
| 13 | Zoom-aware label visibility | ✅ Complete | |
| 14 | Route replay / travel timeline | ✅ Complete | |
| 15 | Couple anniversary / Couple Story panel | ⚠️ Partial | Anniversary date in localStorage only |
| 16 | Production deployment readiness | ✅ Complete | |
| 17 | Environment variable safety | ✅ Complete | |
| 18 | Audio / music infrastructure | ⚠️ Partial | UI wired; no audio files loaded |

---

## Per-Feature Detail

### 1. Auth and User Session — ✅ Complete

**Implementation**: `src/App.tsx` → `AuthProvider` listens to `supabase.auth.onAuthStateChange`. Session is restored on page load via `getSession()`. `ProtectedRoute` blocks unauthenticated access and redirects to `/login` preserving the intended destination. Auth state stored in `authStore`.

**How to test**:
- Visit `/` without being logged in → should redirect to `/login`
- Register a new account → redirected to globe
- Refresh `/globe` (i.e. `/`) → remains logged in
- Click "退出登录" → redirected to `/login`; pressing back does not reveal the globe

**Risks**: None identified. Supabase session refresh is automatic.

---

### 2. User Data Isolation (RLS) — ✅ Complete

**Implementation**: All six Supabase tables (`profiles`, `user_places`, `visit_records`, `photos`, `albums`, `user_settings`) have RLS enabled with `user_id`-scoped policies. Every query in `photoService`, `visitService`, `settingsService` explicitly passes the authenticated `user_id`. No `service_role` key in client code.

**How to test**:
- Register two accounts (A and B)
- Upload a photo as A; log in as B → B's album is empty
- A's photos should never appear for B

**Risks**: RLS policies use `auth.uid() = user_id`. Supabase anon key is safe in the browser because RLS is the enforcement layer.

---

### 3. Photo Upload and Persistence — ✅ Complete

**Implementation**: `usePhotoUpload` hook → `photoService.uploadPhotoFile` (Supabase Storage) + `savePhotoMetadata` (DB). File validation: JPG/PNG/WebP, max 10MB. Signed URLs (1-hour expiry) generated on each `fetchPhotos` call via `createSignedUrls`. File path: `{userId}/{timestamp}_{random}.{ext}`.

**How to test**:
- Upload a photo → appears in album immediately
- Refresh page → photo still appears (persisted to Supabase)
- Upload a file > 10MB → rejected with error message

**Risks**:
- Signed URLs expire after 1 hour. If a user stays on the page for > 1 hour, photo thumbnails will break without a refresh. No auto-renewal mechanism.
- `file_url` column stores the file path, not the URL (comment says "path stored; signed URL generated on read"). This is intentional but the column name is slightly misleading.

---

### 4. Photo Notes / Captions — ✅ Complete

**Implementation**: `notes` field in `UploadPhotoForm` (textarea, optional). Persisted to `photos.notes` column. Surfaced in `StoryPlayback` → story lines include photo notes (up to 2 per date-group, with "还有 N 条回忆..." overflow).

**How to test**:
- Upload a photo with a note → open "播放我们的故事" → the note appears in the story timeline for that date
- Upload without a note → story line shows normally without notes section

**Risks**: Notes are not editable after upload (no edit-photo feature). This is an MVP limitation.

---

### 5. Album Modal — ✅ Complete

**Implementation**: `AlbumModal` supports two views — `album` (photo grid, travel summary, delete city) and `upload` (form). Can be opened for: a specific city, a specific country, via "所有相册" (applies global filters), or via "上传照片" button (opens directly to upload view). `PhotoPreview` provides full-screen keyboard navigation (←→Esc). `DeleteCityConfirmModal` guards city deletion.

**How to test**:
- Click a city marker → album opens for that city
- Click "所有相册" → all photos shown with filters applied
- Click "上传照片" → opens directly to upload form
- In album, press ← / → → navigates photos; Esc → closes preview
- Delete button → confirm modal; confirms → photos + DB record deleted; globe marker disappears

**Risks**: No edit-photo functionality (title, notes, tags cannot be changed after upload).

---

### 6. City Memory Card — ✅ Complete

**Implementation**: `travelSummary` useMemo in `AlbumModal` — computes earliest date, latest date, and photo count from the currently filtered city photos. Rendered as a row below the modal header in album view only.

**How to test**:
- Open a city album with multiple photos taken on different dates → "YYYY.MM.DD – YYYY.MM.DD · N 张照片"
- All photos on same date → "YYYY.MM.DD · N 张照片"
- Empty city album → summary row not shown

**Risks**: None. Derived entirely from already-loaded data.

---

### 7. Add Local City / Country — ✅ Complete

**Implementation**: `AddPlaceModal` → searches `CITIES` + `COUNTRIES` locally → calls `placeStore.addCity` or `addCountry` → `visitService.addUserPlace` inserts into `user_places`. Idempotent (unique constraint violation treated as success). Achievement animation plays on new add. Globe marker appears via `recomputeVisible()` triggered by placeStore subscription.

**How to test**:
- Open "添加国家 / 城市" → search "东京" → click "+ 添加" → achievement animation plays → Tokyo marker appears
- Add same city again → button shows "✓ 已添加" immediately
- Refresh page → added cities still shown (persisted)

**Risks**: None for the happy path. Countries without a capital in the local dataset show a warning "当前数据暂无首都" and the country is added but no city marker appears.

---

### 8. Geoapify Global City Search — ✅ Complete

**Implementation**: `GeoapifyResolver.resolveMany()` fetches `https://api.geoapify.com/v1/geocode/search` with `lang=en`. Wired as Step 2 in `PlaceResolverChain`. `AddPlaceModal` shows "🌐 搜索全球更多结果" button when local results exist; auto-triggers when no local results. 400ms debounce. Candidates deduplicated against local results via `countryId:nameEn.toLowerCase()` key.

**How to test**:
- Search "Hamburg" → no local results → Geoapify triggers automatically → Hamburg candidate appears
- Search "Paris" → local Paris appears first → click "搜索全球更多结果" → Paris Texas and others appear below
- Search with no API key → no global results, no crash

**Known limitation**: Geoapify `lang=en` returns English names only. Chinese city names (e.g. 慕尼黑 for Munich) are not supported for Geoapify-sourced cities. Typing "慕尼黑" will not trigger a Geoapify result.

---

### 9. Geoapify City Persistence After Refresh — ✅ Complete

**Implementation**: 6 columns on `user_places` (`place_source`, `display_name`, `name_en`, `country_name`, `lat`, `lng`). `fetchUserPlaces` rehydrates `ResolvedPlace` from DB fields when `place_source = 'geocoding_api'` and static `getCityById` returns undefined. Migration M001 block in `supabase/schema.sql`.

**How to test**:
- Add Hamburg via Geoapify → refresh page → Hamburg marker and label still visible

**Risks**:
- Migration M001 must be applied to the Supabase production DB before this works. The app code is ready; only the DB columns need to exist.
- If `place_source` column is missing on an older DB instance, geocoded places will silently fall through and not persist.

---

### 10. Geoapify City Delete — ✅ Complete

**Implementation**: `removeCityId()` in placeStore evicts from both `userAddedCityIds` and `geocodedPlaces` in a single Zustand `set()`. This triggers `recomputeVisible()` once via the store subscription, removing both the point marker and the HTML label.

**How to test**:
- Add Hamburg → open Hamburg album → "🗑️ 删除该城市及全部照片" → confirm → Hamburg disappears from globe immediately

**Risks**: None identified.

---

### 11. Sidebar Search and Camera Focus — ✅ Complete

**Implementation**: `SearchPanel` queries: (1) `CITIES` filtered by Chinese/English name, (2) `COUNTRIES` filtered by name, (3) `geocodedPlaces.values()` filtered by `displayName` / `displayNameEn`, deduplicated against local results. Clicking any result calls `setFlyToRequest({ lat, lng, altitude })`. Fly-to animates over 1200ms.

**How to test**:
- Type "Hamburg" → Hamburg appears in dropdown (from geocodedPlaces) → click → globe flies to Hamburg
- Type "中国" → China appears → click → globe zooms to China level
- Type "Tokyo" → Tokyo appears from local data → click → flies to Tokyo

**Known limitation**: Timeline entries and StoryPlayback lines for geocoded cities do not have a flyTo target because `TimelinePanel` uses `getCityById()` (local-only). A photo uploaded against "Hamburg" via the upload form is not possible since the upload form's city dropdown only lists static cities.

---

### 12. Globe Marker Rendering — ✅ Complete

**Implementation**: `recomputeVisible()` (module-level in `GlobeScene`) merges `CITY_POINTS` (local, filtered to `visible` Set) and `geocodedPoints` (from `geocodedPlaces`) into `g.pointsData()`. Visited cities render bright pink (`#ec4899`), country-visited render soft pink (`#fbcfe8`), default pink (`#f472b6`). Replay current city renders vivid rose (`#f43f5e`) with larger radius.

**How to test**:
- On fresh load → only capital cities have markers
- Upload a photo for a non-capital → marker appears
- Add a non-capital via AddPlaceModal → marker appears
- Add Hamburg (geocoded) → Hamburg marker appears in addition to local markers

**Risks**: `pointsData` and `htmlElementsData` are rebuilt on every store change. For very large numbers of geocoded places this could become slow; in practice negligible at current scale.

---

### 13. Zoom-Aware Label Visibility — ✅ Complete

**Implementation**: `LABEL_ALTITUDE_THRESHOLD = 1.5`. `onZoom` callback detects threshold crossing (`wasZoomed !== isZoomed`) and calls `recomputeVisible()` once — no per-frame rebuild. Capital labels always shown. Non-capital static labels and geocoded labels hidden when altitude ≥ 1.5.

**How to test**:
- Zoom out (altitude > 1.5) → only capital city labels visible
- Zoom in on a region (altitude < 1.5) → non-capital city labels appear

**Risks**: None identified.

---

### 14. Route Replay / Travel Timeline — ✅ Complete

**Implementation**: `TimelinePanel` groups photos by date + city/country and provides fly-to on click. `ReplayPanel` + `useReplay` + `replayStore` drive timed playback (0.5×/1×/2× speed). Arc highlighting and city pulse during replay. `buildArcs()` and `buildCitySequence()` use only photos with `city_id` resolvable via `getCityById`.

**How to test**:
- Upload photos for multiple cities → toggle "路线弧线" → arcs appear between cities in date order
- Click play in ReplayPanel → globe flies stop to stop; arc highlights; city pulses
- Click a timeline entry → globe flies to that location

**Known limitation**: Route arcs and timeline fly-to only work for photos whose `city_id` is in the local static CITIES dataset. Geocoded cities (e.g. Hamburg) cannot currently be added to the photo upload form — the city dropdown in `UploadPhotoForm` only lists static cities. So arcs for geocoded destinations are not possible yet.

---

### 15. Couple Anniversary / Couple Story Panel — ⚠️ Partial

**Implementation**: `CoupleStoryPanel` shows days-together counter + editable anniversary date. `StoryPlayback` builds a chronological story from all photos. `useCoupleDate` reads/writes from **localStorage** (`ltg_couple_start_date_{userId}`).

**What works**: Editing the anniversary date, days counter, story playback with photo notes, romantic UI.

**What is incomplete**:
- **Anniversary date uses localStorage** — not Supabase. If the user clears their browser data, switches browsers, or uses a second device, the date resets to the hardcoded fallback `2024-05-20`.
- No `couple_settings` table or equivalent in `supabase/schema.sql`.

**How to test**:
- Open the app → left panel shows "X 天" counter
- Click "编辑纪念日" → pick a date → save → counter updates immediately
- Refresh → date persists (localStorage)
- Open in a different browser → date is gone (risk surface)

**Recommended fix before UI polish**: Add a `couple_settings` row to `user_settings` or a separate table and persist the anniversary date to Supabase.

---

### 16. Production Deployment Readiness — ✅ Complete

**Implementation**: `vercel.json` with SPA rewrite. Build command `npm run build`. Env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEOAPIFY_API_KEY` set in Vercel dashboard. Production smoke-tested by user.

**How to test**:
- Refresh `/` and `/login` in production → no 404
- Auth flow works end to end in production

---

### 17. Environment Variable Safety — ✅ Complete

**Implementation**: Only `VITE_` prefixed keys in client code. `service_role` / secret keys are absent from all source files. `.env.local` / `.env` are in `.gitignore`. `.env.example` with placeholder values is the only committed env file.

`VITE_GEOAPIFY_API_KEY` is intentionally browser-exposed (same model as Mapbox). Geoapify recommends setting HTTP Referrer restrictions in their dashboard, which limits blast radius of key exposure to the registered domain.

**Grep verification**: No `service_role` in source files.

---

### 18. Audio / Music Infrastructure — ⚠️ Partial

**Implementation**: `audioService.ts` provides `playMusic()`, `pauseMusic()`, `playSfx(name)`. `MusicPanel` exposes play/pause toggle and volume sliders. `settingsStore` / `settingsService` persists `music_enabled`, `music_volume`, `sound_effects_enabled`, `sfx_volume` to `user_settings` table. Sound effect hooks are called at: city hover, city click, album open/close, upload success, photo delete.

**What is incomplete**: No audio files are loaded. `playSfx()` and `playMusic()` are silent no-ops until actual audio assets (`.mp3` / `.ogg`) are added and the file paths are wired into `audioService`. This is deferred to the UI Polish phase.

---

## Known Bugs / Suspected Weak Points

| # | Description | Severity | Affected flow |
|---|---|---|---|
| B1 | Anniversary date in localStorage — not cross-device | Medium | Couple Story Panel |
| B2 | Signed photo URLs expire after 1 hour — no auto-refresh | Low | Photo display (long sessions) |
| B3 | Geocoded city names are English-only — Chinese aliases not supported | Low | AddPlaceModal, SearchPanel, globe label |
| B4 | Upload form city dropdown is static-only — can't assign a photo to a geocoded city | Low | UploadPhotoForm, arcs, timeline for geocoded cities |
| B5 | Timeline fly-to fails for geocoded cities (getCityById returns null) | Low | TimelinePanel |
| B6 | StoryPlayback city name lookup (`CITIES.find(...)`) fails for geocoded cities | Low | StoryPlayback |
| B7 | `file_url` column stores file path not URL — column name is misleading | Cosmetic | DB schema readability |

---

## Recommended Next Steps Before UI Polish

1. **Fix B1 (Couple date persistence)** — Migrate anniversary date from localStorage to Supabase. Add a `couple_start_date` column to `user_settings` or extend `user_places`. This is the most impactful gap before shipping to a second user.

2. **Consider B4 (Upload form geocoded cities)** — Decide whether to add geocoded cities to the upload form's city dropdown. This would also fix B5 (timeline fly-to) and B6 (story name lookup). Could be deferred post-polish if geocoded-city photos are not a priority use case.

3. **Wire first audio file** — Even one placeholder SFX will let the audio infrastructure be tested. Can be done in the first polish session.

4. No schema migrations needed before UI polish (unless B1 is fixed).

5. No code refactors needed. Architecture is clean for the planned UI work.

---

## Future Feature Ideas (Post-MVP)

- **Couple sharing** — shared album between two accounts; `shared` / `public` visibility currently UI-only stubs
- **Supabase place_cache table** — cache Geoapify results to reduce API calls (schema design already in `placeResolver.ts`)
- **Chinese city alias handling** — fallback Chinese names for Geoapify-sourced cities (e.g. 慕尼黑 → Munich)
- **Photo editing** — update title, notes, tags, date after upload
- **Signed URL renewal** — auto-refresh signed URLs before they expire in long sessions
- **Multiple globe textures** — let users switch between earth styles (blue marble, night lights, illustrated)
- **Cross-device couple story sync** — push real-time updates when partner adds a photo
- **Landing / intro page** — animated cloud-parting entrance with feature showcase
- **Globe texture redesign** — cartoon / illustrated earth as per BACKLOG-03
- **Companion character** — 天书向导 as per BACKLOG-04

---

## Files Created / Updated This Session

| File | Change |
|---|---|
| `docs/FEATURE_AUDIT.md` | Created (this file) |
| `src/services/geocoding/geoapifyResolver.ts` | Updated stale doc comment (was "stub, not yet wired") |
| `src/services/placeResolver.ts` | Updated stale doc comment (was "Step 2, not yet wired") |
| `src/types/place.ts` | Updated stale doc comment (was "Step 2 (future)") |
