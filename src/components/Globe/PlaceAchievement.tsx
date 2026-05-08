import { useEffect } from 'react'
import { motion } from 'framer-motion'

export interface AchievementPlace {
  kind: 'city' | 'country'
  name: string
  countryName?: string  // for cities
  isCapital?: boolean
  capitalName?: string  // for countries
}

interface PlaceAchievementProps {
  place: AchievementPlace
  onComplete: () => void
}

const SUBTITLES = [
  '一段新的旅行记忆即将在这里开始。',
  '新的坐标已点亮，等待你们的故事。',
  '这里将收藏你们的下一段回忆。',
  'A new memory place has been unlocked.',
]

function buildTitle(place: AchievementPlace): string {
  if (place.kind === 'city') {
    return place.countryName ? `${place.countryName} · ${place.name}` : place.name
  }
  return place.capitalName ? `${place.name} · ${place.capitalName}` : place.name
}

function buildToastLabel(place: AchievementPlace): string {
  if (place.kind === 'country') return '新国家解锁！'
  return place.isCapital ? '首都城市解锁！' : '新城市解锁！'
}

// Deterministic subtitle per place name
function pickSubtitle(place: AchievementPlace): string {
  return SUBTITLES[place.name.length % SUBTITLES.length]
}

// Total animation duration — both layers share the same timeline
const DURATION = 3.4
// Times array: [start, fade-in-end, dwell-end, end]
const TIMES: [number, number, number, number] = [0, 0.14, 0.76, 1]

export function PlaceAchievement({ place, onComplete }: PlaceAchievementProps) {
  // Unmount after animation finishes (component is visually invisible by then)
  useEffect(() => {
    const t = setTimeout(onComplete, (DURATION + 0.15) * 1000)
    return () => clearTimeout(t)
  }, [onComplete])

  const title = buildTitle(place)
  const toastLabel = buildToastLabel(place)
  const subtitle = pickSubtitle(place)

  return (
    <>
      <AchievementToast label={toastLabel} title={title} />
      <AchievementCenter title={title} subtitle={subtitle} />
    </>
  )
}

/* ── Top achievement toast ─────────────────────────────────────────── */

function AchievementToast({ label, title }: { label: string; title: string }) {
  return (
    // Centering wrapper — not animated, no transform conflict with motion.div below
    <div className="fixed top-5 left-0 right-0 flex justify-center z-[80] pointer-events-none select-none">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [-24, 0, 0, -8],
        }}
        transition={{ times: TIMES, duration: DURATION, ease: 'easeOut' }}
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(249,168,212,0.55)',
          boxShadow: '0 4px 20px rgba(244,114,182,0.22), 0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <span className="text-xl leading-none">📍</span>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-pink-400 leading-none mb-1">
            {label}
          </p>
          <p className="text-sm font-bold text-pink-800 leading-tight">{title}</p>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Center ambient text ───────────────────────────────────────────── */
// Rendered at z-[15] — above globe (z-10), below sidebar/modals (z-20+).
// No full-screen veil; text-shadow ensures legibility over any globe surface.

function AchievementCenter({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ times: TIMES, duration: DURATION, ease: 'easeInOut' }}
      className="fixed inset-0 z-[15] flex flex-col items-center justify-center pointer-events-none select-none"
    >
      <div className="flex flex-col items-center gap-3 px-10 text-center">
        <motion.h2
          initial={{ scale: 0.88 }}
          animate={{ scale: [0.88, 1.0, 1.0, 1.06] }}
          transition={{ times: TIMES, duration: DURATION, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(1.7rem, 4.2vw, 2.8rem)',
            fontWeight: 200,
            letterSpacing: '0.14em',
            color: '#fff9f2',
            textShadow: [
              '0 0 28px rgba(255,200,100,0.55)',
              '0 0 60px rgba(255,180,80,0.25)',
              '0 2px 14px rgba(0,0,0,0.55)',
            ].join(', '),
          }}
        >
          {title}
        </motion.h2>

        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: 300,
            letterSpacing: '0.05em',
            color: 'rgba(255,240,220,0.75)',
            textShadow: '0 1px 10px rgba(0,0,0,0.6)',
          }}
        >
          {subtitle}
        </p>
      </div>
    </motion.div>
  )
}
