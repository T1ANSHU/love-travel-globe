# Project Status: Globe Redesign Complete (Stages 1–2)

**Last updated**: 2026-05-10

---

## Globe Redesign — Completed

Full plan: `docs/GLOBE_REDESIGN_PLAN.md`

### Step 0 — Documentation ✅ Complete
- `docs/GLOBE_REDESIGN_PLAN.md`, `docs/GLOBE_VISUAL_CONCEPT.md`, `docs/GLOBE_VISUAL_BACKLOG.md` created
- `docs/globe-references/` folder created

### Stage 1 — Stop Default-Capital Rendering ✅ Complete
- `CAPITAL_CITY_IDS` and `GLOBAL_LABELS` removed from `GlobeScene.tsx`
- `recomputeVisible()` now starts from empty `Set` — no default capitals
- `buildLabelElement` glass-card HTML replaced with `buildMinimalLabel` (text-only)
- Globe initializes with `pointsData([])` and `htmlElementsData([])`
- `CITY_NAME_THRESHOLD = 0.7` (was `LABEL_ALTITUDE_THRESHOLD = 1.5`)
- Static `cities.ts` / `countries.ts` unchanged — search and dropdowns unaffected

### Stage 1.1 — Marker and Label Visual Refinement ✅ Complete
- `pointRadiusCallback` now reads `currentAltitude` for zoom-proportional scaling
  - `altScale = clamp(altitude / 1.5, 0.28, 1.0)` — dots shrink smoothly as camera zooms in
  - `globe.pointRadius(pointRadiusCallback)` called on every zoom tick for continuous update
- City name labels anchored to `lat + 0.6°` north of marker (geographic offset, not pixel shift)
- Label element uses `transform: translate(-50%, -50%)` — centered on its own geographic anchor
- Label style: warm rose text, near-transparent dark pill background, wide letter spacing

### Stage 2 — Country Boundary Layer ✅ Complete
- `world-atlas` + `topojson-client` installed; `@types/topojson-client` added as devDependency
- `tsconfig.app.json`: `resolveJsonModule: true` added
- `COUNTRY_FEATURES` computed once at module load from Natural Earth 110m TopoJSON
- `globe.polygonsData(COUNTRY_FEATURES)` added to init:
  - Fill: `rgba(255,255,255,0.02)` — near-invisible
  - Sides: `rgba(0,0,0,0)` — none
  - Stroke: `rgba(255,200,215,0.18)` — subtle rose-white outline
- Country boundary layer is static — never changes, never affects user place rendering

### Stage 3 — Deferred to UI Polish (do not implement yet)

See `docs/GLOBE_VISUAL_BACKLOG.md` for the full deferred list. Summary:

- Cartoon / illustrated globe texture
- City unlock animation (ring pulse + beam effect)
- Per-city area boundary glow polygon
- Landmark / mini 3D model pop-up from marker
- Final elegant on-map typography
- Unlock sound effect

---

## Testing Checklist (Verified from Code)

| # | Test | Expected | Status |
|---|---|---|---|
| 1 | Fresh globe load | No default capital markers or labels | ✅ (recomputeVisible starts empty) |
| 2 | Country boundaries | Subtle rose-white outlines visible | ✅ (polygonsData with 177 features) |
| 3 | User-added city (Beijing) | Marker appears | ✅ (userAddedCityIds → visible set) |
| 4 | Zoomed out | Only marker visible, city name hidden | ✅ (altitude ≥ 0.7 → htmlElementsData([])) |
| 5 | Zoomed in | Marker smaller, city name appears north | ✅ (altScale + LABEL_LAT_OFFSET=0.6°) |
| 6 | Search London/Hamburg | Results found | ✅ (static data unchanged) |
| 7 | Add Geoapify city | Marker appears on globe | ✅ (geocodedPlaces → recomputeVisible) |
| 8 | Delete city | Disappears immediately | ✅ (removeCityId → recomputeVisible) |
| 9 | Refresh | Added geocoded cities persist | ✅ (Supabase + fetchUserPlaces unchanged) |
| 10 | npm run build | Zero TypeScript errors | ✅ |

---

## Recommended Next Phase

**Do not continue with Stage 3 (heavy animation / cartoon globe) yet.**

The globe logic is now stable. Recommended options in priority order:

### Option A — Production Regression Test (Recommended First)
Run a full manual smoke test in production to confirm that Stages 1–2 did not
break any Phase 1–6 features. Checklist: `docs/PRODUCTION_REGRESSION_CHECKLIST.md`.
Key flows to verify:
- Auth (login / register / logout)
- Photo upload, album view, delete photo
- Add city (local + Geoapify), delete city
- Search, fly-to, route replay, hover preview
- Filters, timeline, stats panel
- Settings persistence (auto-rotate, music, sfx)

### Option B — Small Functional Cleanup
Address known minor gaps before UI Polish:
- `useCoupleDate` hook stores anniversary date in localStorage only — not in Supabase
  (user loses it on new device / browser clear)
- Sidebar search cap (max 8 results) may be too low for Chinese city searches
- `place_cache` table for Geoapify results not yet implemented

### Option C — Emotional Feature Enhancements (Phase 7)
After regression test and any critical cleanup:
- **7.1 City Favorites** — mark cities as favorites; no schema migration risk; recommended first
- **7.2 Travel Story (template)** — auto-generate narrative from existing photo/route data; no external API needed for MVP
- **7.3 Playback Upgrade** — improve ReplayPanel with photo previews and date overlays
Full roadmap: `docs/FUTURE_ROADMAP.md`

### Option D — Globe Stage 3 Visual Polish (Phase 9)
- Cartoon globe texture, city unlock animation (ring pulse + beam), per-city glow polygon
- Deferred items: `docs/GLOBE_VISUAL_BACKLOG.md`
- Do not start until Option A regression test is complete

---

## Hard Constraints (always)

- Do NOT modify Auth, Supabase client, RLS policies, Storage bucket config, or DB schema
- Do NOT break any Phase 1–6 features (auth, upload, albums, replay, search, Geoapify)
- cities.ts / countries.ts static data must remain intact — search and dropdowns depend on it
- Travel statistics must remain photo-only (StatsPanel reads from photoStore, not city data)
- Do NOT start Stage 3 globe animation until Option A regression test is complete
