import { useEffect, useMemo, useRef } from 'react'
import { usePhotoStore } from '../store/photoStore'
import { useGlobeStore } from '../store/globeStore'
import { useReplayStore } from '../store/replayStore'
import { getCityById } from '../data/cities'

export interface ReplayStop {
  cityId: string
  cityName: string
  date: string
  lat: number
  lng: number
}

const STEP_BASE_MS = 2000  // base ms per stop at speed=1

export function useReplaySequence(): ReplayStop[] {
  const photos = usePhotoStore((s) => s.photos)
  return useMemo(() => {
    const sorted = [...photos].sort((a, b) => a.taken_date.localeCompare(b.taken_date))
    const stops: ReplayStop[] = []
    let lastCityId = ''
    for (const p of sorted) {
      if (!p.city_id) continue
      const city = getCityById(p.city_id)
      if (!city) continue
      if (city.id === lastCityId) continue
      stops.push({
        cityId: city.id,
        cityName: city.name,
        date: p.taken_date,
        lat: city.lat,
        lng: city.lng,
      })
      lastCityId = city.id
    }
    return stops
  }, [photos])
}

export function useReplay() {
  const stops = useReplaySequence()
  const playing = useReplayStore((s) => s.playing)
  const currentIndex = useReplayStore((s) => s.currentIndex)
  const speed = useReplayStore((s) => s.speed)
  const setCurrentIndex = useReplayStore((s) => s.setCurrentIndex)
  const setTotal = useReplayStore((s) => s.setTotal)
  const setPlaying = useReplayStore((s) => s.setPlaying)
  const setFlyToRequest = useGlobeStore((s) => s.setFlyToRequest)

  // Keep total in sync
  useEffect(() => {
    setTotal(stops.length)
    if (currentIndex >= stops.length) setCurrentIndex(0)
  }, [stops.length, currentIndex, setTotal, setCurrentIndex])

  // Driver loop
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (!playing || stops.length === 0) return

    const stop = stops[currentIndex]
    if (!stop) return

    // Fly to current stop
    setFlyToRequest({ lat: stop.lat, lng: stop.lng, altitude: 1.0 })

    // Schedule next
    const stepMs = STEP_BASE_MS / speed
    timerRef.current = setTimeout(() => {
      const next = currentIndex + 1
      if (next >= stops.length) {
        setPlaying(false)
        setCurrentIndex(0)
      } else {
        setCurrentIndex(next)
      }
    }, stepMs)

    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    }
  }, [playing, currentIndex, speed, stops, setFlyToRequest, setPlaying, setCurrentIndex])

  return { stops, currentIndex, playing }
}
