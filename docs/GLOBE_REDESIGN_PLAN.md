# Globe Visualization Redesign Plan

**Status**: Step 0 complete (documentation) — Stage 1 implementation pending
**Last updated**: 2026-05-10
**Branch**: main

See `docs/GLOBE_VISUAL_CONCEPT.md` for the authoritative visual rule set.
See `docs/GLOBE_VISUAL_BACKLOG.md` for deferred Stage 3 items.

---

## Product Direction

This site is a **romantic shared travel memory globe**, not a world reference map.
The globe should feel minimal, elegant, and premium.

Only user-unlocked places ever render on the globe.
The globe is a personal artifact — it grows as the user adds memories, not before.

---

## Core Display Rules (Non-Negotiable)

### Unadded / locked cities
- No marker dot
- No city name
- No glow or highlight
- No city boundary polygon
- Static data (cities.ts / countries.ts) stays for search and dropdowns — invisible on globe

### Added / unlocked cities
- Show a small marker dot
- Show city name when zoomed in (altitude < ~0.7)
- Can show city area glow / boundary (Stage 3)

### Globe-wide (always visible)
- Country / continent-level boundary lines — lightweight, subtle
- NO city-level boundaries at startup — too heavy and visually noisy
- City boundaries appear only after the user unlocks that city (Stage 3)

### Stats
- Travel statistics come only from `photoStore.photos` — static city data has zero impact

---

## Architecture Layers (globe.gl)

### Currently Used
| Layer | API | Current State |
|---|---|---|
| Globe texture | `.globeImageUrl()` | Blue marble satellite (wrong direction) |
| Atmosphere | `.showAtmosphere()` | Pink halo — keep |
| City markers | `.pointsData()` | Initialized with ALL capitals (wrong — remove) |
| City labels | `.htmlElementsData()` | Floating glass-card HTML over capitals (wrong — remove) |
| Route arcs | `.arcsData()` | Travel arcs — correct, keep |

### Available But Not Yet Used
| Layer | API | Planned Use |
|---|---|---|
| Country polygons | `.polygonsData()` | Country boundary outlines (Stage 2) |
| Pulse rings | `.ringsData()` | City unlock glow (Stage 3) |
| Custom layer | `.customLayerData()` | Tyndall/beam unlock effect (Stage 3) |

---

## Stage 1 — Logic Clean-up (Next to implement)

**Goal**: Remove all default-capital rendering. Establish correct model.

### What to remove from GlobeScene.tsx
- `CAPITAL_CITY_IDS` constant (rendering-only — placeStore uses `c.isCapital` field instead)
- `GLOBAL_LABELS` constant and all landmark-based label logic
- `directCapitalLabels` computation block
- `capitalLabels` / `nonCapitalLabels` split
- Init `.pointsData(CITY_POINTS.filter(CAPITAL_CITY_IDS))` → `.pointsData([])`
- Init `.htmlElementsData(GLOBAL_LABELS.filter(...))` → `.htmlElementsData([])`
- `buildLabelElement()` glass-card HTML (old floating label — replaced)

### New recomputeVisible() logic
```
visible = userAddedCityIds ∪ photoCityIds ∪ geocodedPlaces.keys()

pointsData       = CITY_POINTS.filter(visible) ∪ geocodedPoints
htmlElementsData = compact city name labels for visible cities
                   shown only when altitude < CITY_NAME_THRESHOLD (≈ 0.7)
```

### New city label style (temporary bridge — not the final design)
- No background card, no border, no blur
- Small text: `font-size: 11px`, `color: rgba(255,255,255,0.9)`, subtle `text-shadow`
- Positioned beside/below the marker dot
- Visible only when zoomed in (altitude < 0.7)
- Marker dot visible at all zoom levels

### What does NOT change in Stage 1
- All user add/delete/search/fly-to behavior
- Geoapify geocoded city rendering
- Arc route replay, album modal, photo upload, auth
- cities.ts / countries.ts static data
- placeStore capital lookup logic

---

## Stage 2 — Country Boundaries (After Stage 1)

**Goal**: Make the globe feel geographically real without being a city reference map.

### Boundary scope — country level only
- **Only country / continent boundaries** are loaded globally at startup
- **No city-level boundaries at startup** — too many, too heavy, visually noisy
- City boundaries appear only after unlock (Stage 3)

### Data
- **Source**: Natural Earth 110m countries GeoJSON (CC0 public domain)
- **Location**: `src/data/world-countries-110m.geo.json`
- **Load method**: static import bundled at build time — no CDN, no runtime fetch
- **Size**: ~400 KB raw / ~18 KB gzip — acceptable

### Rendering
```javascript
globe
  .polygonsData(worldGeoJSON.features)
  .polygonCapColor(() => 'rgba(255,255,255,0.03)')    // near-invisible fill
  .polygonSideColor(() => 'rgba(0,0,0,0)')
  .polygonStrokeColor(() => 'rgba(255,255,255,0.22)') // subtle white boundary
  .polygonsTransitionDuration(0)
```

### Altitude behavior
- High altitude: boundary lines at full opacity
- Low altitude (city zoom): boundary lines fade (not distracting up close)

---

## Stage 3 — Deferred to UI Polish

See `docs/GLOBE_VISUAL_BACKLOG.md` for full detail.

Summary:
- Globe texture swap (blue marble → cartoon / illustrated)
- City unlock animation (ring pulse + Tyndall beam + coordinated timing)
- Per-city area boundary polygon (loaded on demand after unlock)
- City area glow / highlight for unlocked cities
- Anchored city name final visual design (no card, surface-level text)

---

## File Layout

```
src/
  data/
    cities.ts                         — static city data (search + dropdowns only)
    countries.ts                      — static country data (search + dropdowns only)
    world-countries-110m.geo.json     — country boundary polygons (Stage 2)
  components/
    Globe/
      GlobeScene.tsx                  — main globe logic
      AddPlaceModal.tsx               — add city/country UI
      CityHoverPreview.tsx            — hover preview overlay
      PlaceAchievement.tsx            — unlock toast animation

docs/
  GLOBE_REDESIGN_PLAN.md             — this file (implementation plan)
  GLOBE_VISUAL_CONCEPT.md            — authoritative visual rule set
  GLOBE_VISUAL_BACKLOG.md            — Stage 3 deferred items
  globe-references/                  — visual reference images and links
```

---

## Implementation Checklist

- [x] Step 0: Documentation + folders created
- [ ] Stage 1: Remove default-capital rendering; minimal zoom-gated city name
- [ ] Stage 2: Country-level boundary GeoJSON + polygonsData (country scope only)
- [ ] Stage 3: Unlock animation, city glow, per-city boundary, cartoon texture (UI Polish)
