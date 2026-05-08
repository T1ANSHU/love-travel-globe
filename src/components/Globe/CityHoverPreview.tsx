import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGlobeStore } from '../../store/globeStore'
import { usePhotoStore } from '../../store/photoStore'
import { getCityById } from '../../data/cities'

const CARD_W = 192
const PHOTO_W = 132
const PHOTO_H = 99

// Each index maps to [translateX, translateY, rotateDeg, zIndex]
// Photo[0] = main (most recent) → top layer, slight tilt
// Photo[1] = middle → peeks from left-behind
// Photo[2] = back   → peeks from right-behind
const STACK_OFFSETS: [number, number, number, number][] = [
  [  2,  0,   3, 3],
  [-10,  6,  -8, 2],
  [ 14,  8,   9, 1],
]

export function CityHoverPreview() {
  const hoveredCity = useGlobeStore((s) => s.hoveredCity)
  const photos = usePhotoStore((s) => s.photos)

  const cityPhotos = useMemo(() => {
    if (!hoveredCity) return []
    return photos.filter((p) => {
      if (!p.city_id || !p.displayUrl) return false
      const city = getCityById(p.city_id)
      return city?.id === hoveredCity.cityId
    })
  }, [hoveredCity, photos])

  const left = hoveredCity
    ? Math.max(8, Math.min(window.innerWidth - CARD_W - 8, hoveredCity.x - CARD_W / 2))
    : 0
  const top = hoveredCity?.y ?? 0

  return (
    <AnimatePresence>
      {hoveredCity && (
        <motion.div
          key={hoveredCity.cityId}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          className="fixed z-30 pointer-events-none select-none"
          style={{
            left,
            top,
            width: CARD_W,
            transform: 'translateY(calc(-100% - 14px))',
          }}
        >
          {cityPhotos.length === 0 ? (
            /* ── Empty state: keep glass card ── */
            <div className="bg-white/90 backdrop-blur-sm border border-pink-200 rounded-2xl shadow-lg px-4 py-4 text-center">
              <div className="text-xl mb-1">📷</div>
              <p className="text-xs font-medium text-pink-600">还没有照片</p>
              <p className="text-[10px] text-pink-400 mt-0.5">点击添加回忆</p>
            </div>
          ) : (
            /* ── Has photos: bare stacked thumbnails, no container box ── */
            <>
              <PhotoStack photos={cityPhotos.slice(0, 3)} />
              <div className="mt-2 flex justify-center">
                <span
                  className="text-[10px] font-medium text-pink-800 px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(4px)' }}
                >
                  {cityPhotos.length} 张照片 · 点击查看全部
                </span>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PhotoStack({ photos }: { photos: { id: string; displayUrl: string; title: string | null }[] }) {
  // Container height leaves room for rotated photo corners (offsets up to ±8px vertically)
  const containerH = PHOTO_H + 18

  return (
    <div style={{ position: 'relative', height: containerH }}>
      {photos.map((p, i) => {
        const [tx, ty, rot, z] = STACK_OFFSETS[i] ?? STACK_OFFSETS[0]
        return (
          <img
            key={p.id}
            src={p.displayUrl}
            alt={p.title ?? ''}
            style={{
              position: 'absolute',
              width: PHOTO_W,
              height: PHOTO_H,
              // center in container, then apply per-photo offset
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot}deg)`,
              zIndex: z,
              objectFit: 'cover',
              borderRadius: 8,
              boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
            }}
          />
        )
      })}
    </div>
  )
}
