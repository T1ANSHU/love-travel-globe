import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhotoStore } from '../../store/photoStore'
import { COUNTRIES } from '../../data/countries'
import { CITIES } from '../../data/cities'
import type { PhotoWithUrl } from '../../store/photoStore'

const MAX_NOTES_SHOWN = 2

interface StoryLine {
  date: string
  text: string
  notes: string[]    // up to MAX_NOTES_SHOWN non-empty notes from photos in this group
  extraNotes: number // count of notes beyond MAX_NOTES_SHOWN
}

function buildStoryLines(photos: PhotoWithUrl[], startDate: string): StoryLine[] {
  const lines: StoryLine[] = [
    { date: startDate.replace(/-/g, '.'), text: '我们开始了这段旅程。♥', notes: [], extraNotes: 0 },
  ]

  // Group by date + country + city; collect photo notes per group
  type Group = { date: string; countryId: string; cityId: string | null; count: number; notesList: string[] }
  const groups = new Map<string, Group>()

  for (const p of photos) {
    const key = `${p.taken_date}|${p.country_id}|${(p.city_id ?? '').toLowerCase()}`
    if (!groups.has(key)) {
      groups.set(key, { date: p.taken_date, countryId: p.country_id, cityId: p.city_id, count: 0, notesList: [] })
    }
    const g = groups.get(key)!
    g.count++
    const note = p.notes?.trim()
    if (note) g.notesList.push(note)
  }

  const sorted = Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date))

  for (const g of sorted) {
    const country = COUNTRIES.find((c) => c.id === g.countryId)
    const city = g.cityId
      ? CITIES.find((c) => c.id.toLowerCase() === g.cityId!.toLowerCase())
      : null
    const place = city
      ? `${country?.name ?? g.countryId} · ${city.name}`
      : (country?.name ?? g.countryId)

    lines.push({
      date: g.date.replace(/-/g, '.'),
      text: `我们去了 ${place}，留下了 ${g.count} 张照片。`,
      notes: g.notesList.slice(0, MAX_NOTES_SHOWN),
      extraNotes: Math.max(0, g.notesList.length - MAX_NOTES_SHOWN),
    })
  }

  return lines
}

interface Props {
  startDate: string
  onClose: () => void
}

export function StoryPlayback({ startDate, onClose }: Props) {
  const photos = usePhotoStore((s) => s.photos)
  const lines = buildStoryLines(photos, startDate)

  const [visibleCount, setVisibleCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setVisibleCount(1)
    timerRef.current = setInterval(() => {
      setVisibleCount((v) => {
        if (v >= lines.length) {
          clearInterval(timerRef.current!)
          return v
        }
        return v + 1
      })
    }, 1500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allVisible = visibleCount >= lines.length

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pink-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Story card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4 glass-card p-6 flex flex-col gap-4 max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-pink-700">💕 我们的故事</h2>
          <button
            onClick={onClose}
            className="text-pink-400 hover:text-pink-600 transition text-lg leading-none"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {lines.map((line, i) => (
            <AnimatePresence key={i}>
              {i < visibleCount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex gap-3 items-start"
                >
                  {/* Dot + connector */}
                  <div className="flex flex-col items-center pt-1 flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-rose-500' : 'bg-pink-400'}`} />
                    {i < lines.length - 1 && (
                      <div className="w-px flex-1 bg-pink-200 mt-1 min-h-[20px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-2 min-w-0">
                    <p className="text-[11px] font-mono text-pink-400">{line.date}</p>
                    <p className="text-sm text-pink-800 leading-snug">{line.text}</p>

                    {/* Photo notes — only when present */}
                    {line.notes.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        {line.notes.map((note, ni) => (
                          <p
                            key={ni}
                            className="text-[11px] text-pink-500 italic leading-snug break-words"
                          >
                            「{note}」
                          </p>
                        ))}
                        {line.extraNotes > 0 && (
                          <p className="text-[10px] text-pink-400">
                            还有 {line.extraNotes} 条回忆...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Empty state */}
          {lines.length === 1 && allVisible && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-pink-400 text-center italic py-2"
            >
              上传旅行照片，让故事更丰富 📷
            </motion.p>
          )}
        </div>

        {/* Close link after fully revealed */}
        <AnimatePresence>
          {allVisible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-1"
            >
              <button
                onClick={onClose}
                className="text-xs text-pink-500 hover:text-pink-700 transition underline underline-offset-2"
              >
                收起故事
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
