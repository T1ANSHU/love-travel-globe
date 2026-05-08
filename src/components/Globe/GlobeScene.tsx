import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'
import { CITIES, getCityById } from '../../data/cities'
import { LANDMARKS } from '../../data/landmarks'
import { useGlobeStore } from '../../store/globeStore'
import { usePhotoStore } from '../../store/photoStore'
import { useReplayStore } from '../../store/replayStore'
import { usePlaceStore } from '../../store/placeStore'
import { audioService } from '../../services/audioService'
import type { BaseCity, BaseLandmark } from '../../types/travel'
import type { PhotoWithUrl } from '../../store/photoStore'

function _initGlobe(el: HTMLElement) { return new Globe(el) }
type GlobeApi = ReturnType<typeof _initGlobe>

// All city point data (used for filtering in recomputeVisible)
const CITY_POINTS = CITIES.map((c) => ({
  id: c.id,
  lat: c.lat,
  lng: c.lng,
  name: c.name,
  nameEn: c.nameEn,
  countryId: c.countryId,
}))

// Capital city IDs — default visible set on first load
const CAPITAL_CITY_IDS = new Set(CITIES.filter((c) => c.isCapital).map((c) => c.id))

// All global-level landmarks (city labels)
const GLOBAL_LABELS = LANDMARKS.filter((l) => l.level === 'global')

interface ArcDatum {
  arcIndex: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  startCityId: string
  endCityId: string
}

// Build arcs sorted by date — only photos with city_id AND city in CITIES
function buildArcs(photos: PhotoWithUrl[]): ArcDatum[] {
  const orderedCityIds: string[] = []
  const sorted = [...photos].sort((a, b) => a.taken_date.localeCompare(b.taken_date))
  for (const p of sorted) {
    if (!p.city_id) continue
    const city = getCityById(p.city_id)
    if (!city) continue
    if (orderedCityIds.length === 0 || orderedCityIds[orderedCityIds.length - 1] !== city.id) {
      orderedCityIds.push(city.id)
    }
  }
  const arcs: ArcDatum[] = []
  for (let i = 0; i < orderedCityIds.length - 1; i++) {
    const a = getCityById(orderedCityIds[i])
    const b = getCityById(orderedCityIds[i + 1])
    if (!a || !b) continue
    arcs.push({
      arcIndex: i,
      startLat: a.lat,
      startLng: a.lng,
      endLat: b.lat,
      endLng: b.lng,
      startCityId: a.id,
      endCityId: b.id,
    })
  }
  return arcs
}

// Compute deduplicated city sequence from photos (same logic as useReplaySequence)
function buildCitySequence(photos: PhotoWithUrl[]): string[] {
  const sorted = [...photos].sort((a, b) => a.taken_date.localeCompare(b.taken_date))
  const seq: string[] = []
  for (const p of sorted) {
    if (!p.city_id) continue
    const city = getCityById(p.city_id)
    if (!city) continue
    if (seq[seq.length - 1] !== city.id) seq.push(city.id)
  }
  return seq
}

// ── Module-level state — single globe instance, no React re-renders ──────────
let pointerDownX = 0
let pointerDownY = 0
let isDrag = false
let rotateResumeTimer: ReturnType<typeof setTimeout> | null = null
let globeApiRef: GlobeApi | null = null

// Tracks current cursor position for hover preview card placement
let currentMouseX = 0
let currentMouseY = 0

// Visited sets — read by pointColor/pointRadius callbacks
let visitedCityIds: Set<string> = new Set()
let visitedCountryIds: Set<string> = new Set()

// Replay highlight — read by arc/point callbacks
let activeArcIndex = -1          // -1 = no active arc (not playing)
let replayCurrentCityId = ''     // '' = not playing

// ── Callback functions at module level ───────────────────────────────────────

function pauseRotation() {
  if (rotateResumeTimer) { clearTimeout(rotateResumeTimer); rotateResumeTimer = null }
  const controls = globeApiRef?.controls()
  if (controls) controls.autoRotate = false
}

function scheduleResumeRotation() {
  if (rotateResumeTimer) clearTimeout(rotateResumeTimer)
  rotateResumeTimer = setTimeout(() => {
    const controls = globeApiRef?.controls()
    if (controls && useGlobeStore.getState().autoRotate) controls.autoRotate = true
    rotateResumeTimer = null
  }, 1500)
}

// cityId must be a canonical CITIES.id (e.g. 'CN-beijing')
function openPlace(cityId: string, countryId: string, name: string) {
  if (isDrag) return
  audioService.playSfx('city-click')
  useGlobeStore.getState().setSelectedPlace({ type: 'city', cityId, countryId, name })
}

function pointColorCallback(d: object): string {
  const c = d as { id: string; countryId: string }
  // Replay current city → vivid deep rose
  if (replayCurrentCityId && c.id === replayCurrentCityId) return '#f43f5e'
  if (visitedCityIds.has(c.id)) return '#ec4899'           // visited city — bright pink
  if (visitedCountryIds.has(c.countryId)) return '#fbcfe8' // country visited — soft pink
  return '#f472b6'                                         // default
}

function pointRadiusCallback(d: object): number {
  const c = d as { id: string }
  if (replayCurrentCityId && c.id === replayCurrentCityId) return 1.2
  return visitedCityIds.has(c.id) ? 0.85 : 0.5
}

function arcColorCallback(d: object): string[] {
  const arc = d as ArcDatum
  if (activeArcIndex >= 0 && arc.arcIndex === activeArcIndex) {
    // Active arc during replay — full opacity bright rose
    return ['rgba(244,63,94,1)', 'rgba(244,63,94,1)']
  }
  if (activeArcIndex >= 0) {
    // Other arcs dimmed while replay is active
    return ['rgba(244,114,182,0.25)', 'rgba(236,72,153,0.25)']
  }
  // Normal display (no replay)
  return ['rgba(244,114,182,0.85)', 'rgba(236,72,153,0.85)']
}

function arcStrokeCallback(d: object): number {
  const arc = d as ArcDatum
  return (activeArcIndex >= 0 && arc.arcIndex === activeArcIndex) ? 0.9 : 0.35
}

function arcDashTimeCallback(d: object): number {
  const arc = d as ArcDatum
  return (activeArcIndex >= 0 && arc.arcIndex === activeArcIndex) ? 700 : 2800
}

// Distance-based altitude: floor 0.065 prevents z-fighting; scale 0.38 keeps regional
// routes (≤32°) low while intercontinental routes rise naturally to ~0.15-0.22.
// Results: Beijing-Shanghai ~0.065, Shanghai-Chengdu ~0.065, Beijing-Paris ~0.164.
function arcAltitudeCallback(d: object): number {
  const arc = d as ArcDatum
  const toRad = (deg: number) => deg * Math.PI / 180
  const φ1 = toRad(arc.startLat), φ2 = toRad(arc.endLat)
  const Δφ = φ2 - φ1
  const Δλ = toRad(arc.endLng - arc.startLng)
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const angularDist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(0.065, (angularDist / Math.PI) * 0.38)
}

function buildLabelElement(d: object): HTMLElement {
  const lm = d as BaseLandmark & { id: string; countryId: string; cityId?: string }

  // Outer wrapper: globe.gl updates left/top every frame — never mutate its transform
  const wrapper = document.createElement('div')
  wrapper.style.cssText = [
    'pointer-events: none',
    'user-select: none',
    'text-align: center',
    'transform: translate(-50%, -100%)',
  ].join(';')

  // Inner element: all hover/click effects here only
  const inner = document.createElement('div')
  inner.style.cssText = [
    'pointer-events: all',
    'cursor: pointer',
    'display: inline-block',
    'transform-origin: center bottom',
    'transition: transform 0.15s ease',
    'user-select: none',
  ].join(';')

  inner.innerHTML = `
    <div style="
      background: rgba(255,255,255,0.82);
      border: 1px solid rgba(249,168,212,0.7);
      border-radius: 10px;
      padding: 6px 12px 7px;
      font-size: 11px;
      font-weight: 700;
      color: #831843;
      white-space: nowrap;
      backdrop-filter: blur(6px);
      box-shadow: 0 2px 10px rgba(244,114,182,0.25);
      margin-bottom: 3px;
      letter-spacing: 0.02em;
    ">${lm.name}</div>
    <div style="
      width: 5px;
      height: 5px;
      background: #f472b6;
      border-radius: 50%;
      margin: 0 auto;
      box-shadow: 0 0 6px rgba(244,114,182,0.9);
    "></div>
  `

  inner.addEventListener('mouseenter', () => {
    const canonicalCityId = lm.cityId ?? lm.id
    useGlobeStore.getState().setHoveredCity({ cityId: canonicalCityId, x: currentMouseX, y: currentMouseY })
    inner.style.transform = 'scale(1.12)'
    audioService.playSfx('city-hover')
    pauseRotation()
  })

  inner.addEventListener('mouseleave', () => {
    useGlobeStore.getState().setHoveredCity(null)
    inner.style.transform = 'scale(1)'
    scheduleResumeRotation()
  })

  inner.addEventListener('click', (e) => {
    e.stopPropagation()
    if (isDrag) return
    inner.style.transform = 'scale(0.92)'
    setTimeout(() => { inner.style.transform = 'scale(1)' }, 120)
    // Use canonical cityId from landmark (e.g. 'CN-beijing'), NOT landmark.id ('cn-beijing')
    const canonicalCityId = lm.cityId ?? lm.id
    openPlace(canonicalCityId, lm.countryId, lm.name)
  })

  wrapper.appendChild(inner)
  return wrapper
}

function buildPointTooltip(d: object): string {
  const city = d as BaseCity
  return `
    <div style="
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(249,168,212,0.6);
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 12px;
      color: #831843;
      font-family: system-ui, sans-serif;
      box-shadow: 0 4px 16px rgba(244,114,182,0.2);
      pointer-events: none;
    ">
      <div style="font-weight:700;">${city.name}</div>
      <div style="color:#db2777;font-size:10px;margin-top:1px;">${city.nameEn}</div>
    </div>
  `
}

export function GlobeScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeApi | null>(null)
  // Selective subscriptions — GlobeScene only re-renders when autoRotate changes,
  // NOT when hoveredCity, cameraAltitude, or other fields change.
  const autoRotate = useGlobeStore((s) => s.autoRotate)

  // ── Initialise globe ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ''

    const globe = new Globe(el, {
      rendererConfig: { antialias: true, alpha: true },
    })

    globeApiRef = globe

    globe
      .backgroundColor('rgba(0,0,0,0)')
      .backgroundImageUrl(null)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .showAtmosphere(true)
      .atmosphereColor('#f9a8d4')
      .atmosphereAltitude(0.18)

      .pointsData(CITY_POINTS.filter((c) => CAPITAL_CITY_IDS.has(c.id)))
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(pointColorCallback)
      .pointAltitude(0.006)
      .pointRadius(pointRadiusCallback)
      .pointLabel(buildPointTooltip)
      .pointsTransitionDuration(0)

      .htmlElementsData(GLOBAL_LABELS.filter((l) => l.cityId && CAPITAL_CITY_IDS.has(l.cityId)))
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.04)
      .htmlElement(buildLabelElement)
      .htmlTransitionDuration(0)

      .arcsData([] as ArcDatum[])
      .arcStartLat('startLat')
      .arcStartLng('startLng')
      .arcEndLat('endLat')
      .arcEndLng('endLng')
      .arcColor(arcColorCallback)
      .arcStroke(arcStrokeCallback)
      .arcAltitude(arcAltitudeCallback)
      .arcDashLength(0.5)
      .arcDashGap(0.15)
      .arcDashAnimateTime(arcDashTimeCallback)

      .onPointHover((point: object | null) => {
        if (point) {
          const p = point as { id: string }
          useGlobeStore.getState().setHoveredCity({ cityId: p.id, x: currentMouseX, y: currentMouseY })
          audioService.playSfx('city-hover')
          pauseRotation()
          el.style.cursor = 'pointer'
        } else {
          useGlobeStore.getState().setHoveredCity(null)
          scheduleResumeRotation()
          el.style.cursor = ''
        }
      })

      .onPointClick((point: object) => {
        if (isDrag) return
        const p = point as { id: string; countryId: string; name: string }
        openPlace(p.id, p.countryId, p.name)
      })

      .onZoom(({ altitude }: { altitude: number }) => {
        useGlobeStore.getState().setCameraAltitude(altitude)
      })

    // Track cursor position for hover preview card placement (used by setHoveredCity)
    const onMouseMove = (e: MouseEvent) => {
      currentMouseX = e.clientX
      currentMouseY = e.clientY
    }
    // Clear hover when cursor leaves the globe container
    const onMouseLeave = () => {
      useGlobeStore.getState().setHoveredCity(null)
    }
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    globe.pointOfView({ lat: 20, lng: 110, altitude: 2.4 }, 0)
    globe.width(el.offsetWidth).height(el.offsetHeight)

    globeRef.current = globe

    // Drag detection
    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX
      pointerDownY = e.clientY
      isDrag = false
    }
    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownX
      const dy = e.clientY - pointerDownY
      if (Math.sqrt(dx * dx + dy * dy) > 5) isDrag = true
    }
    const onPointerUp = () => { setTimeout(() => { isDrag = false }, 0) }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      if (rotateResumeTimer) { clearTimeout(rotateResumeTimer); rotateResumeTimer = null }
      useGlobeStore.getState().setHoveredCity(null)
      globeApiRef = null
      globe._destructor()
      globeRef.current = null
    }
  }, [])

  // ── Fly-to ────────────────────────────────────────────────────────
  useEffect(() => {
    let prevTs = 0
    const unsub = useGlobeStore.subscribe((state) => {
      const req = state.flyToRequest
      if (req && req.ts !== prevTs && globeApiRef) {
        prevTs = req.ts
        globeApiRef.pointOfView({ lat: req.lat, lng: req.lng, altitude: req.altitude }, 1200)
        const controls = globeApiRef.controls()
        if (controls) {
          controls.autoRotate = false
          setTimeout(() => {
            if (globeApiRef && useGlobeStore.getState().autoRotate) {
              globeApiRef.controls().autoRotate = true
            }
          }, 1400)
        }
      }
    })
    return unsub
  }, [])

  // ── Sync visible markers (capitals + user-added + photo cities) ──────
  useEffect(() => {
    const recomputeVisible = () => {
      const g = globeApiRef
      if (!g) return

      const photos = usePhotoStore.getState().photos
      const { userAddedCityIds, userAddedCountryIds } = usePlaceStore.getState()

      const visible = new Set(CAPITAL_CITY_IDS)

      // Cities with photos
      for (const p of photos) {
        if (p.city_id) {
          const city = getCityById(p.city_id)
          if (city) visible.add(city.id)
        }
      }

      // User-explicitly-added cities
      for (const id of userAddedCityIds) visible.add(id)

      // User-added countries → surface their capital
      for (const countryId of userAddedCountryIds) {
        const capital = CITIES.find((c) => c.countryId === countryId && c.isCapital)
        if (capital) visible.add(capital.id)
      }

      g.pointsData(CITY_POINTS.filter((c) => visible.has(c.id)))
      g.htmlElementsData(GLOBAL_LABELS.filter((l) => l.cityId && visible.has(l.cityId)))
    }

    recomputeVisible()

    const unsubPhoto = usePhotoStore.subscribe((state, prev) => {
      if (state.photos !== prev.photos) recomputeVisible()
    })
    const unsubPlace = usePlaceStore.subscribe((state, prev) => {
      if (
        state.userAddedCityIds !== prev.userAddedCityIds ||
        state.userAddedCountryIds !== prev.userAddedCountryIds
      ) recomputeVisible()
    })
    return () => { unsubPhoto(); unsubPlace() }
  }, [])

  // ── Sync visited sets from photoStore (no re-bind of pointsData) ──
  useEffect(() => {
    const recompute = (photos: PhotoWithUrl[]) => {
      const cs = new Set<string>()
      const cn = new Set<string>()
      for (const p of photos) {
        if (p.country_id) cn.add(p.country_id)
        if (p.city_id) {
          const city = getCityById(p.city_id)
          if (city) cs.add(city.id)
        }
      }
      visitedCityIds = cs
      visitedCountryIds = cn
      const g = globeApiRef
      if (g) {
        g.pointColor(pointColorCallback)
        g.pointRadius(pointRadiusCallback)
      }
    }
    recompute(usePhotoStore.getState().photos)
    const unsub = usePhotoStore.subscribe((state) => recompute(state.photos))
    return unsub
  }, [])

  // ── Sync arcs from photoStore + showArcs toggle ───────────────────
  useEffect(() => {
    const rebuildArcs = () => {
      const g = globeApiRef
      if (!g) return
      const { showArcs } = useGlobeStore.getState()
      const photos = usePhotoStore.getState().photos
      g.arcsData(showArcs ? buildArcs(photos) : [])
    }
    rebuildArcs()
    // Only rebuild when photos change — photos don't change during drag/zoom.
    const unsubPhoto = usePhotoStore.subscribe(rebuildArcs)
    // Only rebuild when showArcs toggle changes — ignore cameraAltitude and other fields.
    const unsubGlobe = useGlobeStore.subscribe((state, prev) => {
      if (state.showArcs !== prev.showArcs) rebuildArcs()
    })
    return () => { unsubPhoto(); unsubGlobe() }
  }, [])

  // ── Replay arc highlight + current city pulse ─────────────────────
  useEffect(() => {
    const unsub = useReplayStore.subscribe((state) => {
      const g = globeApiRef
      if (!g) return
      const { playing, currentIndex } = state
      if (!playing) {
        activeArcIndex = -1
        replayCurrentCityId = ''
      } else {
        // Derive city sequence without calling a React hook
        const photos = usePhotoStore.getState().photos
        const seq = buildCitySequence(photos)
        activeArcIndex = currentIndex - 1   // arc i connects stop i to stop i+1
        replayCurrentCityId = seq[currentIndex] ?? ''
      }
      // Re-evaluate arc and point callbacks (only affects arc/point layers)
      g.arcColor(arcColorCallback)
      g.arcStroke(arcStrokeCallback)
      g.arcDashAnimateTime(arcDashTimeCallback)
      g.pointColor(pointColorCallback)
      g.pointRadius(pointRadiusCallback)
    })
    return unsub
  }, [])

  // ── Sync autoRotate ───────────────────────────────────────────────
  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = autoRotate
  }, [autoRotate])

  // ── Resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      const g = globeRef.current
      if (g) g.width(el.offsetWidth).height(el.offsetHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return <div ref={containerRef} className="absolute inset-0" />
}
