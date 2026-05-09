# Future Feature Roadmap

**Last updated**: 2026-05-10
**Status**: Planning only — none of Phase 7–10 is implemented yet.

This document defines planned future phases beyond the current production baseline (Phases 1–6 + Globe Redesign Stages 1–2). Phases are ordered by dependency and strategic priority.

Current production baseline: `docs/PROJECT_PROGRESS.md`
Globe visual backlog (Stage 3): `docs/GLOBE_VISUAL_BACKLOG.md`

---

## Phase 7: Emotional Feature Enhancements

These features deepen the personal and romantic character of the app without requiring schema redesign or multi-user infrastructure.

### 7.1 — City Favorites / Favorite City Collection

Users can mark a specific city as a favorite.

**Behavior**
- Favorite cities can be highlighted in the city album modal or sidebar (e.g., a star icon)
- Favorite status is per-user and stored in Supabase
- Favorite cities must NOT affect the cities-visited count in StatsPanel
- Later UI Polish can add visual differentiation on the globe (different marker color or glow)

**Implementation notes**
- Simplest approach: add a `is_favorite` boolean column to `user_places`
- Or: a separate `user_favorites` join table if favorites extend to photos/landmarks later
- Do not implement until current single-user place system is confirmed stable

---

### 7.2 — Auto-generated Travel Route Story

Generate a readable couple travel narrative from existing data.

**Input sources**
- Travel route (city sequence + dates from photos)
- Uploaded photos per city
- Photo notes / captions (if added)

**MVP approach**
- Deterministic template text: fill city names, dates, photo counts into a fixed story structure
- No external API call required for MVP
- Example: "你们的旅程从 [城市] 开始，那是 [日期]。途经 [N] 座城市，留下了 [M] 张记忆…"

**Later enhancement**
- AI-generated narrative using Claude API (Anthropic)
- User can regenerate or edit the generated story
- Do not add AI generation until template version is shipped and validated

---

### 7.3 — Memory Playback Mode Upgrade

Improve the current route playback experience in `ReplayPanel`.

**Target feel**: cinematic memory journey, not a data player.

**Improvements to consider**
- Show photo thumbnail for each stop during playback
- Animate through photos at each city before moving to the next stop
- Display city name, travel date, and photo note overlaid on the globe
- Smooth globe camera transitions between stops (easing, arc paths)
- Route arc highlights already exist (Phase 5) — build on top of this

**Constraint**: Advanced animations (particle trails, cinematic shaders) are deferred to Phase 9 UI Polish. Phase 7.3 should only improve the data choreography and basic motion.

---

## Phase 8: Collaboration and Sharing

These features require significant Supabase schema and RLS work. Do not start until Phase 7 and the current single-user model are stable in production.

### 8.1 — Couple / Dual-user Collaborative Account

Two people share a single travel globe.

**Behavior**
- Each person has their own Supabase Auth account
- Both users can add photos, cities, notes, and memories to a shared couple space
- A shared couple record links the two user IDs
- All data (photos, places, settings) in the shared space must be isolated from other couples

**Implementation risks**
- Supabase RLS policies must be redesigned to allow "user A OR user B" access
- `user_id` columns on most tables will need to become `couple_id` or gain a join table
- Photo Storage bucket paths must be reorganized
- This is a breaking schema change — plan carefully before starting

**Hard constraint**: Do not implement until the single-user model has been verified stable for real users over multiple weeks.

---

### 8.2 — Public Sharing Mode

Users can publish a read-only view of their travel globe.

**Behavior**
- User toggles "sharing enabled" in settings
- A unique share link is generated (e.g., `/globe/share/[token]`)
- Public visitors see the globe in read-only mode: no edit, no upload, no add-city
- User can revoke sharing at any time

**Data scope**
- Public view should show: globe markers, city album thumbnails (optional), stats, route arcs
- Public view must NOT expose: private photo metadata, Supabase row IDs, auth tokens
- Photos in Storage must remain behind Supabase signed URLs or be opted-in to public visibility

**Implementation approach**
- A `share_token` column on a new `couple_profiles` or `user_profiles` table
- Supabase RLS: public SELECT policy keyed by `share_token` on specific tables/columns
- A separate read-only route in React that bypasses auth (`/globe/share/[token]`)

---

## Phase 9: UI / Animation / Audio Polish

These are visual and experiential improvements. Most are deferred from Globe Redesign Stage 3.
See `docs/GLOBE_VISUAL_BACKLOG.md` for detailed implementation notes on globe-specific items.

**Globe visual**
- Cartoon / illustrated globe texture (replace blue marble satellite image)
- City map area lighting effect on unlock
- Per-city boundary glow polygon (on-demand after unlock)
- Tyndall-like boundary light beams (city unlock cinematic effect)
- Landmark / mini 3D model pop-up from city marker when zoomed in
- Elegant on-map city name typography (surface-level, not floating)

**Auth and landing pages**
- Login / register page further beautification (particle tuning, layout, animation)
- Globe landing page polish (intro animation, transition from auth to globe)

**Character and onboarding**
- Tianshu guide character: a companion figure or icon that guides new users
- Onboarding flow: first-login tooltip or walkthrough for adding first city

**Audio**
- Unlock sound effect: sacred, ethereal, soft chime — plays with achievement animation
- Background music asset management and library
- Sound effect set (hover, click, upload success, delete)

---

## Phase 10: Production Launch Readiness

Final hardening before inviting real users beyond the initial couple.

**Data isolation**
- Multi-user account data isolation audit
- Supabase RLS policy review for all tables and Storage buckets
- Confirm no user can read another user's photos, places, or settings

**Regression and launch**
- Full production regression test (see `docs/PRODUCTION_REGRESSION_CHECKLIST.md`)
- Real user onboarding: invite first external couple, observe behavior
- Feedback collection mechanism (in-app or external)
- Triage and prioritize fixes based on real user feedback

**Post-launch cycle**
- Minor bug fixes and UX improvements from real usage
- Feature prioritization for the next version based on user requests

---

## Phase Dependency Order

```
Phase 1–6 (complete) → Phase 7 → Phase 8 → Phase 9 → Phase 10
                         ↑
                  Implement first.
                  No schema change required.
                  Can run parallel with Phase 9 polish items.
```

Phase 8 (collaboration) must not start until Phase 7 features are shipped and
Phase 10 isolation audit is complete for the single-user model.

Phase 9 UI polish items can run in parallel with Phase 7 emotional features,
as long as they do not touch shared Zustand stores or Supabase schema.

---

## Implementation Priority (Recommended)

| Priority | Item | Notes |
|---|---|---|
| 1 | Phase 10: regression test + RLS audit | Before adding more features |
| 2 | Phase 7.1: City Favorites | No schema migration risk |
| 3 | Phase 9: Globe Stage 3 polish (texture, unlock animation) | Visual reward for existing features |
| 4 | Phase 7.2: Travel Story (template) | No external API needed for MVP |
| 5 | Phase 7.3: Playback upgrade | Builds on existing ReplayPanel |
| 6 | Phase 9: Audio polish | Requires audio assets |
| 7 | Phase 8.2: Public sharing | Read-only, lower RLS complexity than 8.1 |
| 8 | Phase 8.1: Couple account | Major schema change — plan carefully |
