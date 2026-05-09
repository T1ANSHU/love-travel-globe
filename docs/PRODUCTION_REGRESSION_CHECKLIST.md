# Production Regression Checklist

**Last updated**: 2026-05-10
**Branch**: main
**Build status**: PASS — `npm run build` — 1039 modules, 0 TypeScript errors

This checklist covers all user-facing flows after Stage 1 / 1.1 / Stage 2 globe redesign and the ghost-Paris cascade-delete fix. Each item is derived from reading the current implementation, not from testing in a browser. Manual browser test steps are listed per section.

---

## 1. Auth — Login / Register / Logout

**What the code does**
- `LoginPage` renders `ParticlesBackground` (fixed, z-0) behind a `motion.div` at `relative z-10`
- Auth card uses `--glass-bg: rgba(255,255,255,0.82)` via inline CSS variable override
- Zod schema: email + password ≥ 6 chars; `react-hook-form` + `zodResolver`
- On success: `navigate('/')` → GlobePage; on error: `serverError` state shown inline
- `RegisterPage` follows same pattern with confirm-password field

**Risk**: Particle canvas must be behind the card, not on top.

**Manual checks**
- [ ] /login renders: particles visible behind the glass card, card is interactive
- [ ] Invalid email → inline field error shown, no server call made
- [ ] Wrong password → server error message shown below form
- [ ] Successful login → redirected to / (globe page)
- [ ] /register → create account → auto-login → redirected to /
- [ ] Logout → redirected to /login, globe page inaccessible without auth

---

## 2. Globe Base State

**What the code does**
- `recomputeVisible()` starts from empty `Set<string>()` — no hardcoded capitals
- Country boundaries: `polygonsData(COUNTRY_FEATURES)` from `world-atlas/countries-110m.json` via TopoJSON
- Polygon stroke: `rgba(255,200,215,0.18)`, cap fill: `rgba(255,255,255,0.02)`, altitude: 0.001
- Ghost-Paris fix: `fetchUserPlaces` no longer adds capitals to `userAddedCityIds` from country records

**Risk**: A freshly-logged-in user with no added cities should see an empty globe (no markers, no labels).

**Manual checks**
- [ ] New account (no places, no photos) → globe is empty: no marker dots, no city labels
- [ ] Country boundary lines are visible as subtle pink-white strokes on the globe surface
- [ ] No ghost markers appear for capitals of user-added countries (test: add France as country, delete it, refresh — Paris must not reappear)
- [ ] Console: no errors on globe init

---

## 3. City Search and Add

**What the code does**
- `AddPlaceModal`: local search across `CITIES` + `COUNTRIES`, then optional Geoapify geocoding
- After `addCity()` / `addCountry()` / `addGeocodedPlace()` succeeds → `usePlaceStore` update → `recomputeVisible()` runs via Zustand subscription
- Marker radius: `(visitedCityIds ? 0.75 : 0.42) * altScale` where `altScale = min(1.0, max(0.28, altitude/1.5))`
- City name label: appears only when `currentAltitude < CITY_NAME_THRESHOLD (0.7)`, anchored at `lat + 0.6°` geographic north offset
- Adding a country adds its capital city's marker (via `recomputeVisible()` country→capital path)

**Risk**: Marker/label rendering is altitude-dependent; verify both zoom levels.

**Manual checks**
- [ ] Open AddPlaceModal → search "北京" → Beijing appears in results
- [ ] Add Beijing → modal closes → Beijing marker dot appears on globe immediately
- [ ] Zoom in (scroll in) below altitude 0.7 → city name label appears north of the dot
- [ ] Zoom out above altitude 0.7 → label disappears, dot remains
- [ ] Add a country (e.g., Japan) → its capital Tokyo appears as a marker dot
- [ ] Search for a city not in local data → Geoapify results appear after short delay
- [ ] Add a Geoapify city → marker appears at correct geocoded location

---

## 4. City Delete and Persistence

**What the code does**
- `handleDeleteCity` in `AlbumModal`: deletes photos via `deletePhotosByCityId`, removes city from Supabase `user_places`, calls `removeCityId` in store
- Cascade: if deleted city `isCapital` and its country is in `userAddedCountryIds` → also deletes country record from Supabase and calls `removeCountryId`
- `removeCityId` also evicts from `geocodedPlaces` Map if it was a geocoded place
- After delete: `onClose()` is called — AlbumModal closes, globe re-renders without the city

**Risk**: Capital cities added via "add country" flow must cascade-delete the country record.

**Manual checks**
- [ ] Add a city directly (e.g., Shanghai) → open its album → delete city → marker disappears, album modal closes
- [ ] Add France as a country → Paris marker appears → open Paris album → delete Paris → Paris marker disappears AND France country record is removed (verify: no Paris on next refresh)
- [ ] Add a Geoapify city → delete it → marker and geocoded label both disappear immediately
- [ ] Refresh after delete → deleted cities do not reappear

---

## 5. Sidebar Search and Fly-To

**What the code does**
- `SearchPanel`: searches `CITIES` (max 5) + `COUNTRIES` (max 2) + `geocodedPlaces` (max 3), total cap 8
- Geocoded dedup by `${countryId}:${nameEn.toLowerCase()}`
- Clicking a result triggers `setFlyToRequest` → `GlobeScene` flies camera to city/country lat/lng
- Only user-added cities show in AlbumModal when clicked from search; unadded cities in search results open AddPlaceModal

**Risk**: Geocoded places must appear in search alongside static places.

**Manual checks**
- [ ] Sidebar search "巴黎" → Paris appears in results
- [ ] Click a city in search → globe camera flies to that city
- [ ] If a Geoapify city was added, it appears in search results (not duplicated with local results)
- [ ] Search shows max 8 total results (no overflow)

---

## 6. Albums and Photos

**What the code does**
- `AlbumModal` shows album view (photo grid) or upload view; switches via `setView`
- `useUserPhotos` hook fetches on mount if not yet fetched; `refetch()` called after upload/delete
- Photo filtering: if `place` prop provided → filter by place's city/country/landmark ID; else apply global `filters`
- `PhotoPreview` renders full-screen with swipe navigation and delete option
- `UploadPhotoForm`: selects place (city/country), date, file → uploads to Supabase Storage + inserts metadata row

**Risk**: Photo count in footer must match grid count; upload must immediately reflect in album.

**Manual checks**
- [ ] Open city album → photos display in grid
- [ ] Click a photo → PhotoPreview opens with navigation arrows
- [ ] Delete a photo from preview → photo removed from grid (no refresh needed)
- [ ] Click "+ 上传" → upload form appears; upload a photo → returns to album view, new photo visible
- [ ] Footer shows correct count "N 张回忆 💕"
- [ ] Open album for unadded city → shows EmptyAlbumState with upload prompt

---

## 7. Couple Story / Anniversary

**What the code does**
- `CoupleStoryPanel`: fixed left panel, `useCoupleDate(userId)` → localStorage key `ltg_couple_start_date_{userId}`
- Fallback date: `'2024-05-20'` (hardcoded in `useCoupleDate`)
- Days counter: `Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000))`
- Edit mode: date picker with `max={TODAY}`, save writes to localStorage
- Story playback: `StoryPlayback` component (in-panel animation over photos)

**Known limitation**: Anniversary date is localStorage-only, not synced to Supabase. Clearing browser data resets it to the fallback.

**Manual checks**
- [ ] Couple Story panel visible on left side of globe page
- [ ] Days counter displays correct number of days from anniversary date
- [ ] Click edit → date picker appears → save new date → days counter updates
- [ ] Cancel edit → date unchanged
- [ ] Play story button → StoryPlayback animation runs over existing photos
- [ ] New browser / incognito → fallback date `2024.05.20` shown (expected behavior)

---

## 8. Route / Timeline

**What the code does**
- `TimelinePanel`: groups photos by `taken_date + country_id + city_id` key; sorted chronologically; click entry → `setFlyToRequest` flies globe to city/country
- `ReplayPanel`: reads from `useReplayStore`; requires `stops.length >= 2` to enable playback; speed options: 0.5×, 1×, 2×
- Both panels derive data entirely from `usePhotoStore` photos — no dependency on static city data

**Risk**: Replay requires ≥2 cities with photos. Timeline entries must not duplicate per date+city.

**Manual checks**
- [ ] Timeline panel shows entries sorted by date (oldest first)
- [ ] Click a timeline entry → globe flies to that location
- [ ] With <2 photo cities: ReplayPanel shows "至少需要 2 个不同城市的照片才能回放路线" message
- [ ] With ≥2 photo cities: play button enables, route replays stop by stop
- [ ] Speed control (0.5×/1×/2×) changes replay speed
- [ ] Stop button resets replay to beginning

---

## 9. Stats

**What the code does**
- `StatsPanel`: all derived from `usePhotoStore((s) => s.photos)`
- Country count: `new Set(photos.map(p => p.country_id)).size`
- City count: `new Set(photos.filter(p => p.city_id).map(p => p.city_id)).size`
- Photo count: `photos.length`
- Zero dependency on `userAddedCityIds`, `userAddedCountryIds`, or static `CITIES`/`COUNTRIES` data

**Risk**: Adding cities without photos must NOT inflate stats.

**Manual checks**
- [ ] Add a city with no photos → stats unchanged
- [ ] Add a country (capital marker appears) → stats unchanged
- [ ] Upload a photo tagged to City X → city count +1, country count +1 (if new country), photo count +1
- [ ] Delete all photos for a city → city and country counts decrease correctly

---

## 10. Build / Deploy

**Build result (2026-05-10)**
```
✓ 1039 modules transformed
dist/assets/index-[hash].js    ~847 kB (gzip ~238 kB)
dist/assets/index-[hash].css   ~42 kB
Build time: ~8s
TypeScript: 0 errors
```

**Known bundle notes**
- `world-atlas/countries-110m.json` (~108 KB raw) is inlined in the JS bundle
- No dynamic imports — entire app in one chunk (acceptable for MVP scale)

**Manual checks**
- [ ] `npm run build` completes with 0 errors
- [ ] `npm run preview` → app loads at localhost:4173
- [ ] Globe renders on preview build (TopoJSON, world-atlas path resolution correct)
- [ ] Auth redirect works on preview build (no base-path issues)
- [ ] No console errors on initial page load (auth page + globe page)

---

## Summary Table

| Section | Code Risk | Requires Browser Test |
|---|---|---|
| 1. Auth | Particle z-layering | Yes |
| 2. Globe base | Empty-globe for new user | Yes |
| 3. City add | Zoom-level label toggle | Yes |
| 4. City delete | Capital cascade | Yes |
| 5. Search + fly-to | Geocoded dedup | Yes |
| 6. Albums + photos | Upload → immediate reflection | Yes |
| 7. Couple story | localStorage fallback | Yes (incognito) |
| 8. Timeline + replay | ≥2-city gate | Yes |
| 9. Stats | Photo-only derivation | Yes |
| 10. Build | 0 TS errors | Already confirmed |
