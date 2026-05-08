import { motion } from 'framer-motion'
import { Button } from '../UI/Button'

interface EmptyAlbumStateProps {
  onUpload: () => void
}

export function EmptyAlbumState({ onUpload }: EmptyAlbumStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="text-6xl mb-4 animate-float">📷</div>
      <h3 className="text-lg font-semibold text-pink-700 mb-1">
        这里还没有照片
      </h3>
      <p className="text-sm text-pink-400 mb-6">
        上传你们在这里的第一张回忆吧 💕
        <br />
        <span className="text-xs text-pink-300">Upload your first memory here</span>
      </p>
      <Button onClick={onUpload}>+ 上传第一张照片</Button>
    </motion.div>
  )
}
