# UI / Animation / Audio Polish Plan

> **Status**: Planning stage. Do NOT implement anything until each module's references and design direction are confirmed.

---

## How to use this document

1. Work through **Phase P0** (reference collection) before touching any code.
2. For each module in **Phase P1–P5**, confirm the design direction against collected references, then open a focused implementation session.
3. Mark each module `[ confirmed ]` before asking Claude to implement it.
4. Keep each implementation session scoped to one module — do not bundle multiple modules.

---

## Phase P0 — Reference Collection (prerequisite for all Polish work)

**Goal**: Fill `docs/ui-references/` with screenshots, links, and notes before writing any Polish code.

### Reference sources to explore

| Source | What to look for |
|---|---|
| **shadcn/ui** (ui.shadcn.com) | Component structure, accessible patterns, subtle animations |
| **Magic UI** (magicui.design) | Animated React components — cards, beams, sparkles, blur fade |
| **Aceternity UI** (ui.aceternity.com) | Dramatic scroll effects, spotlight cards, moving borders |
| **Uiverse** (uiverse.io) | CSS-only micro-interactions, button styles, loaders |
| **LottieFiles** (lottiefiles.com) | CC0 / free Lottie animations — clouds, sparkles, loading |
| **Rive** (rive.app/community) | Interactive character animations (Tianshu guide candidate) |
| **Spline Community** (spline.design/community) | 3D scenes, cartoon globe references, dreamy backgrounds |
| **Sketchfab** (sketchfab.com) | Cartoon / stylised 3D globe models (CC license check required) |
| **Lordicon** (lordicon.com) | Animated icon library — thin line, playful, pink-friendly |
| **Motion.dev** (motion.dev) | Framer Motion / Motion One examples, animation recipes |

### Reference collection checklist

```
□ Login / register page — 3–5 dreamy glass-card references
□ Scroll intro page — cloud reveal / scroll-snap references
□ Cartoon globe — 3–5 stylised globe or world-map references
□ Sidebar / panel — frosted-glass UI references
□ Achievement / unlock animation — toast + ambient text references
□ Character companion — sprite / Lottie / Rive guide character references
□ Particle effects — dreamy trailing particle references
□ Audio waveform / music player — minimal elegant player UI
□ Icon set — Lordicon or SVG line icon set that fits the palette
```

---

## Phase P1 — Login / Register Page Polish

**Backlog ref**: not in BACKLOG (standalone module)
**Status**: `[ pending references ]`

### Scope
- Background treatment: animated gradient, floating blobs, or subtle noise texture
- Card layout: GlassCard refinement — warmer tint, softer glow
- Input fields: border transitions, focus glow, error states
- Button: hover glow, loading spinner
- AuthorCredit: minor typography refinement
- Transition between login ↔ register: smooth cross-fade

### Design questions to resolve before implementing
- [ ] Static background vs subtle animated gradient?
- [ ] Mouse-follow light halo on background?
- [ ] Font: keep system default or load Nunito / Quicksand?

---

## Phase P2 — Scroll Intro Page + Cloud Reveal Animation

**Backlog ref**: BACKLOG-01
**Status**: `[ pending references ]`

### Scope
- Pre-login landing: full-screen cloud fog that parts to reveal content
- Vertical scroll-snap feature introduction pages (8 screens)
- Per-screen: dreamy background variation, feature illustration or animation
- Scroll hint: bouncing arrow, "向下滑动" text
- Login page appears at scroll bottom via fade/blur transition
- Route structure: insert before `/login` without breaking ProtectedRoute

### Design questions to resolve before implementing
- [ ] Cloud animation: CSS keyframes vs Lottie asset vs Canvas?
- [ ] Scroll library: native CSS `scroll-snap` vs Framer Motion scroll?
- [ ] Illustrations: SVG custom art vs Lottie vs Spline embeds?
- [ ] Performance budget: max JS added for intro page?

---

## Phase P3 — Globe Visual Polish

**Backlog ref**: BACKLOG-03
**Status**: `[ pending references ]`

### Scope
- Replace current satellite texture with cartoon-style tileset or custom texture
- Ocean: clean layered blue, no noise
- Land: block-colour, low-noise, natural palette
- Country borders: crisp thin line
- Coastlines: slightly more prominent than interior borders
- Polar regions: soft off-white
- Verify city dots, arcs, labels, hover cards remain readable on new globe

### Design questions to resolve before implementing
- [ ] Tile source: Natural Earth styled tiles, custom-painted PNG, or procedural Three.js material?
- [ ] Resolution: balance clarity at zoom vs file size
- [ ] globe.gl texture API: confirm `globeImageUrl` vs custom Three.js material path

---

## Phase P4 — Sidebar, Cards & Micro-interactions

**Backlog ref**: BACKLOG-02 (partial)
**Status**: `[ pending references ]`

### Scope
- GlassCard: warmer tint variant, optional glow prop
- Sidebar panels (FilterPanel, StatsPanel, TimelinePanel, ReplayPanel, MusicPanel): consistent spacing pass
- City label (globe.gl HTML element): sharper border, visited-pulse animation
- PhotoCard (PhotoGrid): lazy-load fade-in, subtle hover zoom
- AlbumModal: open/close animation refinement ("取出相册" effect)
- Hover photo preview (CityHoverPreview): visual polish of stacked photos and pill hint

### Design questions to resolve before implementing
- [ ] "取出相册" open animation: scale origin from city point, or standard centre-scale?
- [ ] Visited city label: pulse ring or glow dot?
- [ ] PhotoCard hover: zoom + border glow, or just border glow?

---

## Phase P5 — Achievement & Unlock Animations

**Backlog ref**: Phase 5.5 Step 3 (existing), BACKLOG-04 (Tianshu integration future)
**Status**: `[ pending references ]`

### Scope
- Achievement toast (top): typography polish, icon replacement (Lordicon?), warmer glass bg
- Achievement centre text: confirm timing, consider adding particle burst on entrance
- Future: Tianshu guide says congratulation text alongside toast (BACKLOG-04 Step 5)

### Design questions to resolve before implementing
- [ ] Keep 📍 emoji or replace with Lordicon animated pin?
- [ ] Add particle burst: CSS confetti vs Lottie vs canvas particles?

---

## Phase P6 — Tianshu Guide Character System

**Backlog ref**: BACKLOG-04
**Status**: `[ pending character design ]` — requires Guide Steps 1–8 to be scoped separately

### Prerequisites before any code
- Character art direction confirmed (sprite / Lottie / Rive)
- BACKLOG-01 (intro scroll) implemented first (Tianshu appears there)
- Rive or Lottie animation files sourced / created

### Implementation order (when ready)
Guide Step 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (see BACKLOG-04 for details)

---

## Phase P7 — Audio Polish

**Status**: `[ fully deferred ]`

All audio work is deferred until the audio asset pipeline is confirmed.

### Items deferred
- Sacred / ethereal city / country unlock sound effect
- Tianshu guide speaking sound (magical whisper / gentle chime)
- Background music asset wiring (MusicPanel UI already exists)
- Interactive sound effects: city-hover, click, album-open, upload-success

### Prerequisites before starting
- Audio asset sources confirmed (CC0 or original)
- `audioService.ts` `playSfx()` / `playBgm()` hooks verified working
- Audio file format and compression standards agreed (MP3 / OGG, ~128kbps)

---

## Constraints (always)

- Do NOT modify Auth, Supabase client, RLS, Storage config, or database schema
- Do NOT break Phase 1–6 functionality
- Every module requires `npm run build` TypeScript zero-error pass
- GlobeScene re-render architecture must be preserved (selective Zustand subscriptions)
- Audio files must have confirmed licensing before being committed
