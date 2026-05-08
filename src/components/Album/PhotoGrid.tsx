import { motion } from 'framer-motion'
import { formatDateTime } from '../../utils/date'
import { getCountryById } from '../../data/countries'
import { getCityById } from '../../data/cities'
import type { PhotoWithUrl } from '../../store/photoStore'

interface PhotoGridProps {
  photos: PhotoWithUrl[]
  onPhotoClick: (index: number) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
      {photos.map((photo, index) => (
        <motion.button
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onPhotoClick(index)}
          className="group relative overflow-hidden rounded-2xl bg-pink-50 aspect-square text-left focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          {photo.displayUrl ? (
            <img
              src={photo.displayUrl}
              alt={photo.title ?? photo.file_name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl">📷</span>
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-5">
            {photo.title && (
              <div className="text-white text-[10px] font-semibold truncate leading-tight">
                {photo.title}
              </div>
            )}
            <div className="text-white/80 text-[9px] truncate leading-tight">
              {formatDateTime(photo.taken_date, photo.taken_time ?? undefined)}
            </div>
            {(photo.country_id || photo.city_id) && (
              <div className="text-white/65 text-[9px] truncate leading-tight">
                {[
                  photo.country_id ? getCountryById(photo.country_id)?.name : null,
                  photo.city_id ? getCityById(photo.city_id)?.name : null,
                ].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )
}
