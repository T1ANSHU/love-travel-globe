import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../UI/GlassCard'
import { Button } from '../UI/Button'
import { StoryPlayback } from './StoryPlayback'

// Relationship start date — hardcoded until user_settings gets a couple_start_date column.
// DB change needed later:
//   ALTER TABLE user_settings ADD COLUMN couple_start_date TEXT NULL;
// Then load/save through settingsService like other settings fields.
const COUPLE_START_DATE = '2024-05-20'

function daysApart(isoDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000))
}

export function CoupleStoryPanel() {
  const [playOpen, setPlayOpen] = useState(false)
  const days = daysApart(COUPLE_START_DATE)
  const displayDate = COUPLE_START_DATE.replace(/-/g, '.')

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

          {/* Days counter */}
          <div className="bg-pink-50/60 rounded-xl p-3 text-center">
            <p className="text-[10px] text-pink-400 mb-0.5">在一起</p>
            <p className="text-3xl font-bold text-rose-500 leading-none">{days}</p>
            <p className="text-[10px] text-pink-400 mt-0.5">天</p>
          </div>

          {/* Start date */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-pink-400">开始日期</span>
            <span className="text-xs font-medium text-pink-600">{displayDate}</span>
          </div>

          {/* Subtitle */}
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
            startDate={COUPLE_START_DATE}
            onClose={() => setPlayOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
