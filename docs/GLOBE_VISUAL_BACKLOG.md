# Globe Visual Backlog — Stage 3 Deferred Items

**Status**: Deferred — implement after Stage 1 and Stage 2 are complete
**Last updated**: 2026-05-10

These items are intentionally deferred. Do not implement them during Stage 1 or Stage 2.

See `docs/GLOBE_VISUAL_CONCEPT.md` for the authoritative visual rule set.
See `docs/GLOBE_REDESIGN_PLAN.md` for the full stage breakdown.

---

## Stage 3 Items

### 1. Globe Texture Swap

**Current**: Blue marble satellite image
**Target**: Illustrated / cartoon texture — soft, warm, hand-drawn feel

- Source: custom asset or licensed illustrated globe texture
- Location when ready: `public/assets/globe-texture-cartoon.jpg` (or similar)
- API: `.globeImageUrl('/assets/globe-texture-cartoon.jpg')`
- Do not swap until a final texture asset is selected and approved

---

### 2. City Unlock Animation

A cinematic unlock moment when a user adds a new city.

**Sequence (proposed)**:
1. Fly-to animation begins (existing behavior)
2. Ring pulse expands outward from the new marker dot
3. Light beam / Tyndall effect rises from the city
4. City name label fades in
5. Achievement toast appears (PlaceAchievement component)

**APIs**:
- Ring pulse: `.ringsData()` / `.ringColor()` / `.ringMaxRadius()` / `.ringPropagationSpeed()`
- Beam: `.customLayerData()` with Three.js cylinder geometry

**Timing**: ring and beam should play simultaneously; toast appears ~0.5s after fly-to lands

---

### 3. Per-City Area Boundary Polygon

After a city is unlocked, show a soft polygon outline of the city's administrative area.

- **Data source**: Geoapify Place Details API, or Natural Earth urban areas dataset (10m)
- **Load method**: on-demand fetch after unlock — do NOT bundle all city boundaries at startup
- **Rendering**: `.polygonsData()` filtered to unlocked cities only
- **Style**: very low opacity fill, subtle white stroke — same aesthetic as country boundaries but softer
- **Caching**: store fetched boundary GeoJSON in `placeStore` alongside the city entry

---

### 4. City Area Glow / Highlight

For unlocked cities, a soft radial glow centered on the marker dot.

- Implemented as an additional `ringsData` ring with very slow propagation (or static)
- Color: warm gold or white, very low opacity
- Visible at all zoom levels but subtle

---

### 5. Anchored City Name — Final Visual Design

The Stage 1 city name label is a temporary bridge (plain text, no card, beside the dot).

**Final target**:
- Text rendered at surface level — feels "painted on" the globe, not floating
- Possible approach: Three.js `SpriteText` or canvas texture label
- Font: smaller, lighter weight, slight tracking
- No background, no border, no blur
- Scales with zoom naturally (not fixed pixel size)

---

## Non-Goals for Stage 3

- Political color fill for countries (conflicts with illustrated aesthetic)
- City population or data overlays
- Real-time data feeds
- Heatmap layer
- 3D extruded buildings
