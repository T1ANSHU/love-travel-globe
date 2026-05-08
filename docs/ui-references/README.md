# UI Reference Collection

> Drop screenshots, links, and notes here before starting any Polish implementation.
> Each subdirectory maps to one design module. Fill these before asking Claude to write code.

---

## How to use

1. Browse each reference source listed below.
2. Save screenshots or paste URLs + notes into the relevant subdirectory file.
3. Once a module has 3–5 solid references, mark it ready in `docs/UI_POLISH_PLAN.md`.

---

## Reference Sources

| Source | URL | Best for |
|---|---|---|
| **shadcn/ui** | ui.shadcn.com | Component patterns, accessible glass cards, subtle motion |
| **Magic UI** | magicui.design | Animated React components — beams, sparkles, blur-fade, meteors |
| **Aceternity UI** | ui.aceternity.com | Scroll effects, spotlight cards, moving borders, 3D card tilt |
| **Uiverse** | uiverse.io | CSS micro-interactions, button glow, pill chips, loaders |
| **LottieFiles** | lottiefiles.com/free-animations | CC0 Lottie: clouds, sparkles, hearts, loading spinners |
| **Rive** | rive.app/community | Interactive character animation (Tianshu guide candidate) |
| **Spline Community** | spline.design/community | 3D dreamy backgrounds, cartoon globe scenes |
| **Sketchfab** | sketchfab.com | Stylised / cartoon 3D globe models — check CC license |
| **Lordicon** | lordicon.com | Animated icon library — thin line, playful, pink-friendly |
| **Motion.dev** | motion.dev/docs | Framer Motion recipes, scroll-based animation examples |

---

## Module Subdirectories

### `login-register/`
References for the login and register page redesign.
- Dreamy glass-card layouts
- Animated gradient or blob backgrounds
- Soft input focus states
- CTA button glow effects

### `scroll-intro/`
References for the scroll-snap feature introduction page + cloud reveal.
- Cloud fog / volumetric cloud animations
- Vertical scroll-snap landing page layouts
- Per-section reveal animations
- Scroll hint arrows (bouncing / breathing)

### `globe/`
References for the cartoon-style globe redesign (BACKLOG-03).
- Simplified / illustrated world map styles
- Clean ocean + land colour palette examples
- Border line styles (thin, crisp)
- Tile sources or texture paintings to consider

### `sidebar-cards/`
References for sidebar panels, GlassCard variants, and city labels.
- Frosted-glass panel UI
- Chip / tag filter styles
- Timeline and replay panel layouts
- Compact stats display

### `album-modal/`
References for AlbumModal open animation and PhotoCard polish.
- "Open a memory box" reveal animation
- Photo grid hover effects
- Stacked-photo visual styles
- Album cover treatments

### `achievement-animation/`
References for achievement toast and centre ambient text polish.
- Game-style unlock toast designs
- Ambient text / title reveal over a scene
- Confetti or particle burst on unlock
- Sacred / glowing text treatments

### `tianshu-guide/`
References for the Tianshu companion character (BACKLOG-04).
- Sprite / Lottie / Rive character examples
- Floating companion UI patterns
- Dialogue bubble designs (minimal, non-intrusive)
- Particle trail / fairy dust effects

### `icons/`
References for icon set direction.
- Lordicon animated icon previews
- Custom SVG line icon examples
- Pink / rose coloured icon sets

### `audio-player/`
References for MusicPanel and audio control UI.
- Minimal elegant music player designs
- Volume slider styles
- Play/pause button animations

---

## Notes on licensing

- **LottieFiles**: filter by "Free" — check individual file license (some are CC0, some require attribution)
- **Rive**: free community files are usable; confirm terms per file
- **Sketchfab**: filter by Creative Commons; "CC-BY" requires attribution, "CC0" is fully free
- **Lordicon**: free tier has limited icons; premium pack may be needed for full set
- **Spline**: scenes are generally free to embed; confirm terms for exported assets
- Audio files (deferred): all audio must be CC0 or original before committing to the repo
