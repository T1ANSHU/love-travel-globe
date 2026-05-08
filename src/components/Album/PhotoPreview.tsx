import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDateTime } from '../../utils/date'
import { deletePhoto } from '../../services/photoService'
import { useUser } from '../../hooks/useAuth'
import type { PhotoWithUrl } from '../../store/photoStore'

interface PhotoPreviewProps {
  photos: PhotoWithUrl[]
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
  onDeleted: () => void
}

export function PhotoPreview({ photos, index, onIndexChange, onClose, onDeleted }: PhotoPreviewProps) {
  const user = useUser()
  const photo = photos[index]

  const prev = useCallback(() => onIndexChange(Math.max(0, index - 1)), [index, onIndexChange])
  const next = useCallback(() => onIndexChange(Math.min(photos.length - 1, index + 1)), [index, photos.length, onIndexChange])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, onClose])

  const handleDelete = async () => {
    if (!user || user.id !== photo.user_id) return
    if (!window.confirm('确认删除这张照片？此操作无法恢复。')) return
    const { error } = await deletePhoto(photo.id, photo.file_path)
    if (error) { alert(`删除失败: ${error}`); return }
    onDeleted()
  }

  if (!photo) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Card — stop propagation so clicks inside don't close */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative max-w-2xl w-full mx-4 rounded-3xl overflow-hidden bg-white/10 backdrop-blur border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative bg-black max-h-[60vh] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={photo.id}
              src={photo.displayUrl}
              alt={photo.title ?? photo.file_name}
              className="max-h-[60vh] max-w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          {/* Prev / Next */}
          {index > 0 && (
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition"
            >‹</button>
          )}
          {index < photos.length - 1 && (
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition"
            >›</button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition text-sm"
          >✕</button>
        </div>

        {/* Info bar */}
        <div className="px-5 py-4 bg-white/95">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {photo.title && (
                <p className="font-semibold text-pink-800 text-sm truncate">{photo.title}</p>
              )}
              <p className="text-xs text-pink-500 mt-0.5">
                {formatDateTime(photo.taken_date, photo.taken_time ?? undefined)}
              </p>
              {photo.notes && (
                <p className="text-xs text-gray-500 mt-1">{photo.notes}</p>
              )}
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {photo.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Delete — only owner */}
            {user?.id === photo.user_id && (
              <button
                onClick={handleDelete}
                className="flex-shrink-0 text-xs text-rose-400 hover:text-rose-600 px-3 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                删除
              </button>
            )}
          </div>

          {/* Dots */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1 mt-3">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-4 bg-pink-500' : 'w-1.5 bg-pink-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
