import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { usePhotoUpload } from '../../hooks/usePhotoUpload'
import { Button } from '../UI/Button'
import { COUNTRIES } from '../../data/countries'
import { CITIES, getCitiesByCountry } from '../../data/cities'
import { LANDMARKS, getLandmarksByCity } from '../../data/landmarks'
import type { SelectedPlace } from '../../store/globeStore'
import type { PhotoVisibility } from '../../types/photo'

const schema = z.object({
  title: z.string().min(1, '请填写照片标题'),
  takenDate: z.string().min(1, '请填写拍摄日期'),
  takenTime: z.string().optional(),
  countryId: z.string().min(1, '请选择所属国家'),
  cityId: z.string().optional(),
  landmarkId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // comma-separated input, split on submit
  visibility: z.enum(['private', 'shared', 'public']),
})
type FormFields = z.infer<typeof schema>

const VISIBILITY_OPTIONS: { value: PhotoVisibility; label: string; hint: string; icon: string }[] = [
  { value: 'private', label: '仅自己', hint: '只有你能看到', icon: '🔒' },
  { value: 'shared', label: '伴侣可见', hint: '未来共享相册预留', icon: '💞' },
  { value: 'public', label: '公开', hint: '未来开放公开预留', icon: '🌐' },
]

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white/70 px-3 py-2 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition'
const labelClass = 'block mb-1 text-xs font-medium text-pink-700'

interface UploadPhotoFormProps {
  place?: SelectedPlace | null
  onSuccess: () => void
  onCancel: () => void
}

export function UploadPhotoForm({ place, onSuccess, onCancel }: UploadPhotoFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, uploading, error: uploadError, success } = usePhotoUpload(onSuccess)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      countryId: place?.countryId ?? '',
      cityId: place?.cityId ?? '',
      landmarkId: place?.landmarkId ?? '',
      visibility: 'private',
    },
  })

  const watchedVisibility = watch('visibility')

  const watchedCountryId = watch('countryId')
  const watchedCityId = watch('cityId')

  const availableCities = watchedCountryId ? getCitiesByCountry(watchedCountryId) : CITIES
  const availableLandmarks = watchedCityId
    ? getLandmarksByCity(watchedCityId)
    : watchedCountryId
      ? LANDMARKS.filter((l) => l.countryId === watchedCountryId)
      : []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setFileError(null)
    if (f) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
        setFileError('只支持 JPG、PNG、WebP 格式')
        setFile(null)
        return
      }
      if (f.size > 10 * 1024 * 1024) {
        setFileError('照片大小不能超过 10MB')
        setFile(null)
        return
      }
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const onSubmit = async (data: FormFields) => {
    if (!file) { setFileError('请选择一张照片'); return }
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    await upload({
      file,
      title: data.title,
      takenDate: data.takenDate,
      takenTime: data.takenTime || undefined,
      countryId: data.countryId,
      cityId: data.cityId || undefined,
      landmarkId: data.landmarkId || undefined,
      notes: data.notes || undefined,
      tags,
      visibility: data.visibility,
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="text-5xl mb-3 animate-bounce-in">✨</div>
        <p className="text-lg font-semibold text-pink-700">上传成功！</p>
        <p className="text-sm text-pink-400 mt-1">照片已保存到你们的旅行相册</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
      {/* File picker */}
      <div>
        <label className={labelClass}>选择照片 *</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 hover:bg-pink-50 cursor-pointer transition group"
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-cover rounded-2xl" />
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <span className="text-xs text-pink-400 mt-1 group-hover:text-pink-500">
                点击选择 JPG / PNG / WebP（最大 10MB）
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {fileError && <p className="mt-1 text-xs text-rose-500">{fileError}</p>}
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>照片标题 *</label>
        <input type="text" placeholder="给这张照片起个名字" className={inputClass} {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>拍摄日期 *</label>
          <input type="date" className={inputClass} {...register('takenDate')} />
          {errors.takenDate && <p className="mt-1 text-xs text-rose-500">{errors.takenDate.message}</p>}
        </div>
        <div>
          <label className={labelClass}>拍摄时间（可选）</label>
          <input type="time" className={inputClass} {...register('takenTime')} />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className={labelClass}>所属国家 *</label>
        <select
          className={inputClass}
          {...register('countryId')}
          onChange={(e) => {
            setValue('countryId', e.target.value)
            setValue('cityId', '')
            setValue('landmarkId', '')
          }}
        >
          <option value="">请选择国家</option>
          {COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.nameEn})</option>
          ))}
        </select>
        {errors.countryId && <p className="mt-1 text-xs text-rose-500">{errors.countryId.message}</p>}
      </div>

      {/* City */}
      <div>
        <label className={labelClass}>所属城市（可选）</label>
        <select
          className={inputClass}
          {...register('cityId')}
          onChange={(e) => {
            setValue('cityId', e.target.value)
            setValue('landmarkId', '')
          }}
        >
          <option value="">请选择城市</option>
          {availableCities.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.nameEn})</option>
          ))}
        </select>
      </div>

      {/* Landmark */}
      {availableLandmarks.length > 0 && (
        <div>
          <label className={labelClass}>所属地标（可选）</label>
          <select className={inputClass} {...register('landmarkId')}>
            <option value="">请选择地标</option>
            {availableLandmarks.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className={labelClass}>备注（可选）</label>
        <textarea
          rows={2}
          placeholder="写下这个瞬间的记忆..."
          className={`${inputClass} resize-none`}
          {...register('notes')}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>标签（可选，用逗号分隔）</label>
        <input type="text" placeholder="例如: 美食, 夜景, 情侣照" className={inputClass} {...register('tags')} />
      </div>

      {/* Visibility */}
      <div>
        <label className={labelClass}>可见范围</label>
        <div className="grid grid-cols-3 gap-2">
          {VISIBILITY_OPTIONS.map((opt) => {
            const active = watchedVisibility === opt.value
            return (
              <label
                key={opt.value}
                className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 cursor-pointer transition text-center ${
                  active
                    ? 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-white/40 border-pink-200 text-pink-400 hover:bg-pink-50'
                }`}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register('visibility')}
                />
                <span className="text-base">{opt.icon}</span>
                <span className="text-[11px] font-semibold">{opt.label}</span>
                <span className="text-[9px] opacity-80">{opt.hint}</span>
              </label>
            )
          })}
        </div>
        <p className="mt-1 text-[10px] text-pink-400">
          目前所有照片都仅对你可见，"伴侣可见 / 公开" 为未来共享功能预留
        </p>
      </div>

      {/* Server error */}
      {uploadError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {uploadError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          取消
        </Button>
        <Button type="submit" loading={uploading} className="flex-1">
          上传照片 ✨
        </Button>
      </div>
    </form>
  )
}
