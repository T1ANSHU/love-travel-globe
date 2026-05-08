# UI Style Guide — Love Travel Globe

> **Status**: Draft — to be refined after reference collection.
> Do NOT use this to start coding. Confirm each section against collected references first.

---

## Visual Identity

### Core mood keywords
dreamy · romantic · sacred · soft · cute · glass-morphism · memory-album · fairy-tale · pastel glow · weightless

### Target feeling per page

| Page / Module | Target feeling |
|---|---|
| Landing / intro scroll | Magical arrival, gentle cloud reveal, wonder |
| Login / Register | Warm, intimate, safe harbour |
| Globe (main map) | Expansive, alive, quietly glowing |
| Sidebar / panels | Frosted-glass companion, unobtrusive |
| Album modal | Precious memory box being opened |
| Achievement animation | Sacred unlock, soft celebration |
| Tianshu guide | Friendly companion, light and playful |

---

## Colour Palette

> Exact hex values to be locked in after reference review.

### Primary — Pink / Rose
```
pink-100  #fce7f3   backgrounds, subtle fills
pink-200  #fbcfe8   borders, dividers, gentle accents
pink-300  #f9a8d4   secondary UI elements
pink-400  #f472b6   interactive states, hover
pink-500  #ec4899   primary actions, active states
rose-400  #fb7185   achievement highlights, warm emphasis
rose-500  #f43f5e   destructive / delete, vivid accents
```

### Neutral / Background
```
white/90  rgba(255,255,255,0.9)   glass card backgrounds
white/50  rgba(255,255,255,0.5)   subtle fills
#fff9f2                           warm white (achievement centre text)
```

### Glow / Ambient
```
rgba(249,168,212,0.55)   pink atmosphere glow (globe)
rgba(255,200,100,0.55)   golden unlock glow (achievement title)
rgba(255,180,80,0.25)    warm ambient halo
```

### Globe — Cartoon target palette (BACKLOG-03, not yet finalised)
```
Ocean:    clean layered blue — #4a9eda → #2178b4
Land:     desaturated green/tan — #8db87a / #c9b48a / #e8dfc0
Borders:  fine white or light-grey line
Ice/Snow: #f0f4f6
```

---

## Typography

> Font choice to be confirmed after reference review. Options: Nunito, Quicksand, DM Sans, Noto Sans SC.

### Scale

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| Modal title | `text-base` (1rem) | 700 | normal |
| Section heading | `text-xs` (0.75rem) | 600 | `tracking-wide` |
| Body / label | `text-sm` (0.875rem) | 400 | normal |
| Caption / meta | `text-[10px]` | 400–500 | normal |
| Achievement title | `clamp(1.7rem, 4.2vw, 2.8rem)` | 200 | `0.14em` |
| Achievement subtitle | `0.8125rem` | 300 | `0.05em` |

### Chinese / English mix
- Chinese text: Noto Sans SC or system default CJK
- Avoid bold weight on Chinese body text (400–500 is sufficient)

---

## Spacing & Layout

- Border radius vocabulary: `rounded-xl` (12px) for cards/chips, `rounded-2xl` (16px) for modals, `rounded-full` for pills/avatars
- Consistent internal padding: `px-5 py-4` for modal headers, `px-5 py-3` for content sections
- Consistent gap: `gap-2` between icon and label, `gap-3` between list items

---

## Glass-morphism (GlassCard)

Current implementation reference:
```css
background: rgba(255, 255, 255, 0.88)
backdrop-filter: blur(12px)
border: 1px solid rgba(249, 168, 212, 0.55)
box-shadow: 0 4px 20px rgba(244, 114, 182, 0.22), 0 1px 4px rgba(0,0,0,0.08)
```

Polish direction:
- Keep `backdrop-filter: blur` as the foundation
- Slightly warmer tint on modals (cream-white vs pure white)
- Hover states: border brightens to `pink-300`, shadow softly expands
- Avoid full-opacity white backgrounds — always preserve some translucency

---

## Iconography

- Current: emoji icons (📍 📷 🗑️ etc.) — acceptable for MVP, to be reviewed in Polish
- Target direction: Lordicon animated icons or custom SVG line icons for key actions
- Style: thin line, rounded cap, soft pink / rose stroke
- References to collect: see `docs/ui-references/README.md`

---

## Animation Vocabulary

> Timing and easing to be confirmed after Framer Motion / GSAP reference review.

| Type | Duration | Easing | Notes |
|---|---|---|---|
| Modal enter | 300ms | spring (stiffness 300, damping 28) | scale 0.94→1 + y 20→0 |
| Modal exit | 200ms | ease-out | scale + fade |
| Toast slide-in | ~480ms (0–14% of 3.4s) | ease-out | y -24→0 |
| Achievement dwell | ~2.1s | — | keyframe hold |
| Hover lift | 150ms | ease-out | translateY -2px |
| Hover glow pulse | 2s | ease-in-out | infinite, subtle |
| Globe fly-to | 1200ms | — | globeStore flyToRequest |
| Chip toggle | 150ms | ease | border + bg color swap |

---

## Components to Polish

### GlassCard
- Current: functional, correct blur
- Target: warmer tint option, optional `glow` prop for highlighted cards

### Button
- Current: gradient pink → rose, scale-95 active
- Target: confirm hover glow, disabled state refinement

### AuthorCredit
- Keep as-is; minor typography refinement only

### City label (buildLabelElement in GlobeScene)
- Current: inline HTML, glass bg, pink text
- Target: sharper border, optional visited pulse animation

### PhotoCard (PhotoGrid)
- Current: signed-URL image + overlay
- Target: smoother lazy-load fade-in, subtle hover zoom

---

## Deferred (Audio Polish)

- Sacred / ethereal city unlock sound effect — deferred (BACKLOG audio)
- Background music asset wiring — deferred (MusicPanel UI ready, no files yet)
- Tianshu guide speaking sound — deferred (BACKLOG-04 Guide Step 8)
- All audio deferred until `audioService` / `MusicPanel` / asset pipeline is finalised

---

## Hard constraints

- Do NOT modify Auth, Supabase client, RLS, Storage config, or database schema
- Do NOT break Phase 1–6 functionality during Polish changes
- Do NOT add audio files until licensing is confirmed (CC0 or original)
- Every Polish change requires a `npm run build` pass before merging
