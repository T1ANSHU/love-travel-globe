import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../UI/GlassCard'
import { getCountryById } from '../../data/countries'
import type { SelectedPlace } from '../../store/globeStore'

interface DeleteCityConfirmModalProps {
  place: SelectedPlace
  photoCount: number
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function DeleteCityConfirmModal({
  place,
  photoCount,
  onConfirm,
  onCancel,
}: DeleteCityConfirmModalProps) {
  const [deleting, setDeleting] = useState(false)
  const countryName = getCountryById(place.countryId)?.name ?? place.countryId

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
      >
        <GlassCard className="pointer-events-auto w-full max-w-sm bg-white/95 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none mt-0.5">⚠️</span>
            <div>
              <h3 className="text-base font-bold text-rose-700">删除城市确认</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                删除该城市会同时删除该城市下的所有照片，此操作不可恢复。
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">城市</span>
              <span className="font-semibold text-rose-800">{place.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">国家</span>
              <span className="font-semibold text-rose-800">{countryName}</span>
            </div>
            <div className="flex justify-between border-t border-rose-100 pt-1.5 mt-1.5">
              <span className="text-gray-500">将删除照片</span>
              <span className="font-semibold text-rose-600">{photoCount} 张</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 rounded-xl py-2 text-sm font-medium text-pink-600 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 rounded-xl py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 active:scale-95 transition disabled:opacity-60"
            >
              {deleting ? '删除中…' : '确认删除'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </>
  )
}
