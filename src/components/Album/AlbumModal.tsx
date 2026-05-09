import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhotoStore, applyPhotoFilters } from '../../store/photoStore'
import { usePlaceStore } from '../../store/placeStore'
import { useAuthStore } from '../../store/authStore'
import { useUserPhotos } from '../../hooks/useUserPhotos'
import { deletePhotosByCityId } from '../../services/photoService'
import { deleteUserPlaceByCity, deleteUserPlaceByCountry } from '../../services/visitService'
import { getCityById } from '../../data/cities'
import { PhotoGrid } from './PhotoGrid'
import { PhotoPreview } from './PhotoPreview'
import { EmptyAlbumState } from './EmptyAlbumState'
import { UploadPhotoForm } from './UploadPhotoForm'
import { DeleteCityConfirmModal } from './DeleteCityConfirmModal'
import { GlassCard } from '../UI/GlassCard'
import { Button } from '../UI/Button'
import type { SelectedPlace } from '../../store/globeStore'

type ModalView = 'album' | 'upload'

interface AlbumModalProps {
  place: SelectedPlace | null
  initialView?: ModalView
  onClose: () => void
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${y}.${m}.${d}`
}

export function AlbumModal({ place, initialView = 'album', onClose }: AlbumModalProps) {
  const [view, setView] = useState<ModalView>(initialView)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // This call also triggers the initial fetch on mount if not yet fetched
  const { refetch } = useUserPhotos()
  const allPhotos = usePhotoStore((s) => s.photos)
  const filters = usePhotoStore((s) => s.filters)
  const loading = usePhotoStore((s) => s.loading)

  // When a place is selected, filter by place only (ignore global filters).
  // When browsing all photos (place===null), apply global sidebar filters.
  const photos = useMemo(() => {
    if (place) {
      return allPhotos.filter((p) => {
        if (place.type === 'country') return p.country_id === place.countryId
        if (place.type === 'city') return p.city_id === place.cityId
        if (place.type === 'landmark') return p.landmark_id === place.landmarkId
        return false
      })
    }
    return applyPhotoFilters(allPhotos, filters)
  }, [allPhotos, place, filters])

  // Travel summary — only for city albums with at least one photo
  const travelSummary = useMemo(() => {
    if (place?.type !== 'city' || photos.length === 0) return null
    const dates = photos.map((p) => p.taken_date).sort()
    return { earliest: dates[0], latest: dates[dates.length - 1], count: photos.length }
  }, [place, photos])

  const title = place
    ? `${place.name} 的相册`
    : '我的相册'

  const handleUploadSuccess = () => {
    refetch()
    // Show the new photo in album view after a short delay
    setTimeout(() => setView('album'), 1200)
  }

  const handleDeleted = () => {
    refetch()
    setPreviewIndex(null)
  }

  const handleDeleteCity = async () => {
    if (!place || place.type !== 'city') return
    const userId = useAuthStore.getState().user?.id
    if (!userId) return

    const toDelete = photos.map((p) => ({ id: p.id, file_path: p.file_path }))
    const { storageErrors } = await deletePhotosByCityId(toDelete)

    // Remove photos from local store
    usePhotoStore.getState().removePhotos(photos.map((p) => p.id))

    if (place.cityId) {
      // Delete the explicit city record (no-op if it doesn't exist)
      await deleteUserPlaceByCity(userId, place.cityId)
      usePlaceStore.getState().removeCityId(place.cityId)

      // If this city is the capital of a user-added country, also remove that
      // country record. Without this, the capital re-appears on every refresh
      // because recomputeVisible() adds it back via userAddedCountryIds.
      const city = getCityById(place.cityId)
      const { userAddedCountryIds } = usePlaceStore.getState()
      if (city?.isCapital && place.countryId && userAddedCountryIds.has(place.countryId)) {
        await deleteUserPlaceByCountry(userId, place.countryId)
        usePlaceStore.getState().removeCountryId(place.countryId)
      }
    }

    if (storageErrors.length > 0) {
      setDeleteError(`部分文件删除失败：\n${storageErrors.join('\n')}`)
      setShowDeleteConfirm(false)
      return
    }

    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <GlassCard className="pointer-events-auto w-full max-w-xl bg-white/90 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              {view === 'upload' && (
                <button
                  onClick={() => setView('album')}
                  className="text-pink-400 hover:text-pink-600 text-sm transition mr-1"
                >
                  ← 返回
                </button>
              )}
              <h2 className="text-base font-bold text-pink-800">
                {view === 'upload' ? '📷 上传照片' : `📁 ${title}`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {view === 'album' && (
                <Button
                  variant="ghost"
                  className="!px-3 !py-1 !text-xs"
                  onClick={() => setView('upload')}
                >
                  + 上传
                </Button>
              )}
              <button
                onClick={onClose}
                className="h-7 w-7 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-500 flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* City travel summary — only in album view with photos */}
          {view === 'album' && travelSummary && (
            <div className="px-5 py-2 border-b border-pink-50 flex-shrink-0 text-center">
              <p className="text-[11px] text-pink-400">
                {travelSummary.earliest === travelSummary.latest
                  ? `${fmtDate(travelSummary.earliest)} · ${travelSummary.count} 张照片`
                  : `${fmtDate(travelSummary.earliest)} – ${fmtDate(travelSummary.latest)} · ${travelSummary.count} 张照片`}
              </p>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {view === 'album' ? (
                <motion.div
                  key="album"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-3xl animate-spin">🌸</div>
                    </div>
                  ) : photos.length === 0 ? (
                    <EmptyAlbumState onUpload={() => setView('upload')} />
                  ) : (
                    <PhotoGrid
                      photos={photos}
                      onPhotoClick={(i) => setPreviewIndex(i)}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  <UploadPhotoForm
                    place={place}
                    onSuccess={handleUploadSuccess}
                    onCancel={() => setView('album')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Photo count footer */}
          {view === 'album' && photos.length > 0 && (
            <div className="px-5 py-2 border-t border-pink-100 flex-shrink-0">
              <p className="text-xs text-pink-400 text-center">{photos.length} 张回忆 💕</p>
            </div>
          )}

          {/* Delete city — only shown for city albums in album view */}
          {view === 'album' && place?.type === 'city' && (
            <div className="px-5 py-2 border-t border-rose-50 flex-shrink-0">
              {deleteError && (
                <p className="text-[10px] text-rose-500 text-center mb-1 whitespace-pre-wrap">{deleteError}</p>
              )}
              <button
                onClick={() => { setDeleteError(null); setShowDeleteConfirm(true) }}
                className="w-full text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50 py-1.5 rounded-lg transition"
              >
                🗑️ 删除该城市及全部照片
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Photo preview — rendered above album modal */}
      <AnimatePresence>
        {previewIndex !== null && (
          <PhotoPreview
            photos={photos}
            index={previewIndex}
            onIndexChange={setPreviewIndex}
            onClose={() => setPreviewIndex(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>

      {/* Delete city confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && place?.type === 'city' && (
          <DeleteCityConfirmModal
            place={place}
            photoCount={photos.length}
            onConfirm={handleDeleteCity}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
