# Project Status: Globe Redesign in Progress

## Current Active Work

**Globe Visualization Redesign** — replacing the old default-capital rendering model
with a minimal, romantic, user-unlocked-only globe.

Full plan: `docs/GLOBE_REDESIGN_PLAN.md`

### Step 0 — Documentation ✅ Complete
- `docs/GLOBE_REDESIGN_PLAN.md` created
- `docs/globe-references/` folder created
- `docs/NEXT_PHASE.md` and `docs/PROJECT_PROGRESS.md` updated

### Stage 1 — Stop default-capital rendering (Next)

**What to implement:**
1. Remove `CAPITAL_CITY_IDS` from `GlobeScene.tsx` rendering logic
2. Remove `GLOBAL_LABELS` / `directCapitalLabels` / floating glass-card label system
3. Simplify `recomputeVisible()`: visible = user-added + photo-tagged + geocoded only
4. Globe initializes with `pointsData([])` and `htmlElementsData([])`
5. Replace old floating glass-card label with minimal zoom-gated city name (altitude < 0.7)
6. Remove `buildLabelElement` glass-card HTML; replace with lightweight text-only label
7. Repurpose `LABEL_ALTITUDE_THRESHOLD` as `CITY_NAME_THRESHOLD ≈ 0.7`
8. Run `npm run build` — TypeScript zero errors required

**What must NOT change:**
- cities.ts / countries.ts static data (search, upload dropdown still use these)
- placeStore capital lookup logic (uses `c.isCapital` field, not `CAPITAL_CITY_IDS`)
- All user add/delete/search/fly-to behavior
- Geoapify geocoded city rendering
- Arc route replay, album modal, photo upload, auth

### Stage 2 — Country boundaries (After Stage 1)

**What to implement:**
1. Download Natural Earth 110m GeoJSON → `src/data/world-countries-110m.geo.json`
2. Static import in `GlobeScene.tsx`
3. `globe.polygonsData(features)` with translucent fill + subtle white stroke
4. Altitude-responsive opacity: full at high altitude, fades when zoomed into city level

### Stage 3 — Deferred to UI Polish
- Globe texture swap (blue marble → cartoon/illustrated)
- City unlock animation (ring pulse + beam/tyndall effect)
- Per-city area glow polygon
- Anchored city name final visual design
- Coordinated unlock moment animation sequence

---

## Previously Completed

**Phase 6 + Global Place System (Production Live)**

All development phases (1 → 2 → 3 → 4 → 5 → 5.5 → 6 → Post-Launch) complete and
manually tested in production. See `docs/PROJECT_PROGRESS.md` for full history.

- Phase 6: tag filtering, city memory card, Vercel deployment
- Post-Launch: Geoapify geocoding, global city search, geocoded city persistence

---

## Hard Constraints (always)

- Do NOT modify Auth, Supabase client, RLS policies, Storage bucket config, or DB schema
- Do NOT break any Phase 1–6 features (auth, upload, albums, replay, search, Geoapify)
- cities.ts / countries.ts static data must remain intact — search and dropdowns depend on it
- Travel statistics must remain photo-only (StatsPanel reads from photoStore, not city data)
