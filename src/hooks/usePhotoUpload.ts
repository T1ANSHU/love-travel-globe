import { useState } from 'react'
import { useUser } from './useAuth'
import { validatePhotoFile, uploadPhotoFile, savePhotoMetadata } from '../services/photoService'
import type { PhotoVisibility } from '../types/photo'

export interface UploadFormData {
  file: File
  title: string
  countryId: string
  cityId?: string
  landmarkId?: string
  takenDate: string
  takenTime?: string
  notes?: string
  tags?: string[]
  visibility?: PhotoVisibility
}

export function usePhotoUpload(onSuccess?: () => void) {
  const user = useUser()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const upload = async (formData: UploadFormData) => {
    if (!user) { setError('请先登录'); return }

    const validationError = validatePhotoFile(formData.file)
    if (validationError) { setError(validationError); return }

    setUploading(true)
    setError(null)
    setSuccess(false)

    // 1. Upload file to Storage
    const uploadResult = await uploadPhotoFile(user.id, formData.file)
    if ('error' in uploadResult) {
      setError(uploadResult.error)
      setUploading(false)
      return
    }

    // 2. Save metadata to DB
    const saveResult = await savePhotoMetadata({
      userId: user.id,
      filePath: uploadResult.filePath,
      fileName: formData.file.name,
      title: formData.title,
      countryId: formData.countryId,
      cityId: formData.cityId,
      landmarkId: formData.landmarkId,
      takenDate: formData.takenDate,
      takenTime: formData.takenTime || undefined,
      notes: formData.notes,
      tags: formData.tags,
      visibility: formData.visibility ?? 'private',
    })

    if ('error' in saveResult) {
      setError(saveResult.error)
      setUploading(false)
      return
    }

    setUploading(false)
    setSuccess(true)
    onSuccess?.()
  }

  const clearError = () => setError(null)
  const clearSuccess = () => setSuccess(false)

  return { upload, uploading, error, success, clearError, clearSuccess }
}
