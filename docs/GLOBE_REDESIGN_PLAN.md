# Globe Visualization Redesign Plan

**Status**: Step 0 complete (documentation) — Stage 1 implementation pending
**Date**: 2026-05-10
**Branch**: main

---

## Product Direction

This site is a **romantic shared travel memory globe**, not a world reference map.
The globe should feel minimal, elegant, and premium.

The visualization system has three stages of work. Only user-unlocked places should
ever render on the globe. The globe is a personal artifact, not a geographic reference.

---

## Core Rules (Non-Negotiable)

1. **No default markers** — no city dots visible before the user adds anything
2. **No default labels** — no floating city name tags before the user adds anything
3. **Unlocked = visible** — only user-added places (local or Geoapify) render on the globe
4. **Country boundaries globally visible** — the globe should feel like a map without being a city reference
5. **City names only when zoomed in** — names are contextual, not ambient
6. **Static data stays** — cities.ts / countries.ts data is kept for search, upload, and dropdowns
7. **Stats only from photos** — static city data has zero impact on travel statistics

---

## Architecture Layers (globe.gl)

### Currently Used
| Layer | API | Current State |
|---|---|---|
| Globe texture | `.globeImageUrl()` | Blue marble satellite (photorealistic) |
| Atmosphere | `.showAtmosphere()` | Pink halo |
| City markers | `.pointsData()` | Initialized with ALL capital city IDs (wrong) |
| City labels | `.htmlElementsData()` | Floating glass-card HTML over capitals (wrong) |
| Route arcs | `.arcsData()` | Travel arcs — correct, keep |

### Available But Not Yet Used
| Layer | API | Planned Use |
|---|---|---|
| Country polygons | `.polygonsData()` | Country boundary outlines (Stage 2) |
| Pulse rings | `.ringsData()` | City unlock glow effect (Stage 3) |
| Custom layer | `.customLayerData()` | Tyndall/beam effect on unlock (Stage 3) |

---

## Stage 1 — Logic Clean-up (Next to implement)

**Goal**: Remove all default-capital rendering. Establish correct model: only user-unlocked places visible.

### What to remove from GlobeScene.tsx
- `CAPITAL_CITY_IDS` constant (rendering use only — not needed by placeStore)
- `GLOBAL_LABELS` constant and all landmark-based label logic
- `directCapitalLabels` computation block
- `capitalLabels` / `nonCapitalLabels` labeling split
- Old `LABEL_ALTITUDE_THRESHOLD` logic (threshold concept kept but repurposed)
- Init `.pointsData(CITY_POINTS.filter(CAPITAL_CITY_IDS))` → change to `.pointsData([])`
- Init `.htmlElementsData(GLOBAL_LABELS.filter(...))` → change to `.htmlElementsData([])`
- `buildLabelElement()` glass-card HTML structure (old floating label style)

### New recomputeVisible() logic
```
visible = userAddedCityIds ∪ photoCityIds ∪ geocodedPlaces.keys()

pointsData  = CITY_POINTS.filter(visible) + geocodedPoints
htmlElementsData = minimal city name labels for visible cities, zoom-gated at altitude < 0.7
```

### New city label style (temporary bridge)
- No background card, no border, no blur
- Small text only: `font-size: 11px`, `color: rgba(255,255,255,0.9)`, light `text-shadow`
- Positioned beside/below the marker dot (not above it in a tall card)
- Visible only when `altitude < CITY_NAME_THRESHOLD` (≈ 0.7)
- Marker dot remains visible at all zoom levels

### What does NOT change
- All user add/delete/search/fly-to logic
- Geoapify geocoded city rendering
- Arc route replay
- Album modal, photo upload, auth
- cities.ts / countries.ts static data (search and dropdowns still work)
- placeStore capital lookup (`c.isCapital` field — not affected by removing CAPITAL_CITY_IDS)

---

## Stage 2 — Country Boundaries (After Stage 1)

**Goal**: Make the globe feel geographically grounded without being a city reference map.

### Data
- **Source**: Natural Earth 110m countries GeoJSON (public domain / CC0)
- **Location**: `src/data/world-countries-110m.geo.json`
- **Load method**: static import (bundled, no CDN dependency)
- **Size**: ~400KB raw, ~18KB gzip — acceptable for inline bundle

### Rendering
```
globe
  .polygonsData(worldGeoJSON.features)
  .polygonCapColor(() => 'rgba(255, 255, 255, 0.03)')   // very light fill
  .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
  .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.22)') // subtle white boundary
  .polygonsTransitionDuration(0)
```

### Altitude behavior
- At high altitude: boundary lines at full opacity
- At low altitude (city zoom): boundary lines fade out (not distracting)
- No per-city boundary polygons in this stage

---

## Stage 3 — Unlock Effects & Final Visual (Deferred to UI Polish)

**These are NOT implemented now. Design direction only.**

### Globe texture
- Replace blue marble with a cartoon / illustrated / stylized texture
- Options: custom-painted tile URL, or custom Three.js material
- Color palette: warm pastels, dreamlike, romantic

### City unlock moment (coordinated animation)
When a new city is first added:
1. Camera flies to city → zooms in
2. At arrival: marker dot appears + pulse ring expands outward (ringsData)
3. Soft upward beam / Tyndall light rises from city location (customLayerData or CSS)
4. City name fades in (anchored to map, not floating)
5. Existing `PlaceAchievement` toast animation continues unchanged
6. Total duration: ~2s for globe effects, PlaceAchievement runs in parallel

### City focus effect (lighter, for search fly-to of already-added city)
- Camera flies + zooms
- Brief ring pulse (shorter, lower opacity)
- City name becomes visible
- No beam effect

### City name anchoring (final design)
- Name rendered as `htmlElementsData` element, but restyled:
  - No card background
  - Text sits horizontally at map surface level
  - Color: distinct from marker (e.g. white or cream vs pink marker)
  - Small dot connector between name and marker
  - Visible only when zoomed in (altitude < 0.6)

### City area glow
- Per-unlocked-city: small GeoJSON polygon loaded on demand
- Rendered via `polygonsData` with glowing fill color
- Separate from global country boundary layer
- Data strategy: pre-bundle major city polygons, lazy-load others

---

## File Layout

```
src/
  data/
    cities.ts                         — static city data (search, dropdown)
    countries.ts                      — static country data (search, dropdown)
    world-countries-110m.geo.json     — country boundary polygons (Stage 2)
  components/
    Globe/
      GlobeScene.tsx                  — main globe logic
      AddPlaceModal.tsx               — add city/country UI
      CityHoverPreview.tsx            — hover preview overlay
      PlaceAchievement.tsx            — unlock toast animation

docs/
  GLOBE_REDESIGN_PLAN.md             — this file
  globe-references/                  — visual reference images and links
    .gitkeep
```

---

## Implementation Checklist

- [x] Step 0: Documentation + folders created
- [ ] Stage 1: Remove default-capital rendering, minimal zoom-gated city name
- [ ] Stage 2: Country boundary GeoJSON + polygonsData integration
- [ ] Stage 3: Unlock animation, city glow, cartoon texture (UI Polish phase)

---

## References Folder

Place inspiration images, screenshots, and design reference links in:
`docs/globe-references/`

Suggested categories:
- `cartoon-globe/` — stylized globe textures and art directions
- `city-unlock/` — animation references for unlock moments
- `country-boundary/` — boundary style references (minimal, elegant)
- `overall-ui/` — full UI composition references
