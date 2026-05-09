import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../UI/GlassCard'
import { Button } from '../UI/Button'
import { StoryPlayback } from './StoryPlayback'
import { useCoupleDate } from '../../hooks/useCoupleDate'
import { useAuthStore } from '../../store/authStore'

// Latest valid date for the date picker
const TODAY = new Date().toISOString().slice(0, 10)

function daysApart(isoDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000))
}

export function CoupleStoryPanel() {
  const userId = useAuthStore((s) => s.user?.id)
  const { date, save } = useCoupleDate(userId)

  const [playOpen, setPlayOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(date)

  const days = daysApart(date)
  const displayDate = date.replace(/-/g, '.')

  const handleEditStart = () => {
    setDraft(date)   // always reset draft to current saved date
    setEditing(true)
  }

  const handleSave = () => {
    if (draft) save(draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditing(false)
  }

  return (
    <>
      <motion.div
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 w-56"
        initial={{ x: -240, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.4 }}
      >
        <GlassCard className="p-4 flex flex-col gap-3">
          {/* Header */}
          <div>
            <h2 className="text-sm font-bold text-pink-700 tracking-wide">💕 我们的故事</h2>
            <p className="text-[10px] text-pink-400 mt-0.5">共同旅行的每一刻</p>
          </div>

          {/* Days counter — always visible */}
          <div className="bg-pink-50/60 rounded-xl p-3 text-center">
            <p className="text-[10px] text-pink-400 mb-0.5">在一起</p>
            <p className="text-3xl font-bold text-rose-500 leading-none">{days}</p>
            <p className="text-[10px] text-pink-400 mt-0.5">天</p>
          </div>

          {/* Start date — view mode or edit mode */}
          {editing ? (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-pink-500 font-medium">选择纪念日</label>
              <input
                type="date"
                value={draft}
                max={TODAY}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-lg border border-pink-200 bg-white/60 px-2 py-1.5 text-xs text-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!draft}
                  className="flex-1 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-3 py-1.5 text-[11px] font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-full border border-pink-200 bg-white/30 px-3 py-1.5 text-[11px] text-pink-600 transition hover:bg-pink-50/50"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] text-pink-400">开始日期</p>
                <p className="text-xs font-medium text-pink-600">{displayDate}</p>
              </div>
              <button
                onClick={handleEditStart}
                className="text-[10px] text-pink-400 hover:text-pink-600 underline underline-offset-2 transition"
              >
                编辑纪念日
              </button>
            </div>
          )}

          {/* Romantic subtitle */}
          <p className="text-[10px] text-pink-500 italic text-center leading-relaxed px-1">
            "每一张照片，都是我们故事的一页"
          </p>

          {/* Play button */}
          <Button
            variant="primary"
            className="w-full text-xs py-2 px-3"
            onClick={() => setPlayOpen(true)}
          >
            ▶ 播放我们的故事
          </Button>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {playOpen && (
          <StoryPlayback
            key="story-playback"
            startDate={date}
            onClose={() => setPlayOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
