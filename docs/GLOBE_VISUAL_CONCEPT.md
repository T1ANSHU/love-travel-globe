# Globe Visual Concept — Authoritative Rule Set

**Status**: Active — Stages 1 and 2 implemented; Stage 3 deferred to UI Polish
**Last updated**: 2026-05-10

This document defines what the globe must look and feel like. It takes precedence over any earlier notes or experimental ideas.

---

## Product Identity

This globe is a **romantic shared memory artifact**, not a world reference map.

- It is personal: it grows as the couple adds memories, not before
- It is minimal and premium: nothing clutters the globe except what the user has earned
- Unadded places are invisible — the globe is not an atlas

---

## Visibility Rules (Non-Negotiable)

### Unadded / locked cities
- No marker dot
- No city name label
- No glow, highlight, or boundary polygon
- Static data in `cities.ts` / `countries.ts` remains for search and dropdowns — but is never rendered on the globe

### Added / unlocked cities
- Small marker dot — visible at all zoom levels
- City name label — visible only when zoomed in (altitude < 0.7)
- City area glow / boundary polygon — Stage 3 only, after unlock

### Globe surface (always visible)
- Country and continent boundary lines — lightweight, subtle white strokes
- No city-level boundaries at startup — too many, too heavy, visually noisy
- City boundaries appear only after the user unlocks that city (Stage 3)

---

## Visual Tone

| Element | Target feel |
|---|---|
| Globe texture | Illustrated / cartoon — soft, hand-drawn, warm. Not satellite imagery. |
| Atmosphere | Soft pink halo — romantic, not scientific |
| Country boundaries | Subtle white lines — geographic orientation without reference-map weight |
| Marker dots | Small, clean, slightly glowing |
| City name labels | Minimal text, no card, no border — surface-level feel |
| Unlock animation | Rewarding, cinematic — ring pulse + light beam (Stage 3) |

---

## Color Palette (Target)

- Globe ocean: illustrated blue-green (not satellite deep blue)
- Globe land: warm illustrated tones (cream, ochre, sage — not political color map)
- Country boundaries: `rgba(255, 255, 255, 0.22)` — subtle, recedes at distance
- Marker dots: warm white or gold, slight glow
- City name text: `rgba(255,255,255,0.9)`, small, subtle `text-shadow`
- Atmosphere: pink halo, keep existing

---

## Zoom Behavior

| Altitude range | Visible elements |
|---|---|
| > 1.5 (far out) | Globe texture, atmosphere, country boundaries, marker dots |
| 0.7 – 1.5 | Above + city name labels begin appearing |
| < 0.7 (city zoom) | All above at full visibility; boundary lines may fade slightly |

---

## What Never Appears

- City markers or labels for unadded cities (even capitals)
- City-level boundary polygons at startup
- Travel statistics derived from static city data
- Any reference-map styling (political colors, grid lines, projection labels)

---

## Stage Implementation Order

1. **Stage 1** — Remove default-capital rendering; establish user-data-only visibility model
2. **Stage 2** — Country boundary lines via Natural Earth 110m GeoJSON (`polygonsData`)
3. **Stage 3** — Cartoon texture, unlock animation, per-city glow polygon, anchored city name

See `docs/GLOBE_REDESIGN_PLAN.md` for the full implementation checklist.
See `docs/GLOBE_VISUAL_BACKLOG.md` for all Stage 3 deferred items.
