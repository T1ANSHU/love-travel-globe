import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../UI/GlassCard'
import { Button } from '../UI/Button'
import { AuthorCredit } from '../UI/AuthorCredit'
import { useGlobeStore } from '../../store/globeStore'
import { SearchPanel } from './SearchPanel'
import { FilterPanel } from './FilterPanel'
import { StatsPanel } from './StatsPanel'
import { GlobeControlPanel } from './GlobeControlPanel'
import { MusicPanel } from './MusicPanel'
import { TimelinePanel } from './TimelinePanel'
import { ReplayPanel } from './ReplayPanel'

export function Sidebar() {
  const [open, setOpen] = useState(true)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const displayName = user?.user_metadata?.display_name ?? user?.email ?? '旅行者'
  const setShowUploadModal = useGlobeStore((s) => s.setShowUploadModal)
  const setShowAllAlbums = useGlobeStore((s) => s.setShowAllAlbums)
  const setShowAddPlace = useGlobeStore((s) => s.setShowAddPlace)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur border border-pink-200 text-pink-600 shadow-md hover:bg-pink-50/50 transition"
        aria-label={open ? '收起侧边栏' : '展开侧边栏'}
      >
        {open ? '✕' : '☰'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-72 z-20 p-4 flex flex-col gap-4 overflow-y-auto"
          >
            {/* User card */}
            <GlassCard className="mt-14 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-pink-800 truncate">{displayName}</p>
                <p className="text-xs text-pink-400 truncate">{user?.email}</p>
              </div>
            </GlassCard>

            {/* Stats */}
            <StatsPanel />

            {/* Upload */}
            <GlassCard className="p-4">
              <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-3">我的相册</h3>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setShowAllAlbums(true)}>
                  📁 所有相册
                </Button>
                <Button className="flex-1" onClick={() => setShowUploadModal(true)}>
                  📷 上传照片
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-pink-400 text-center">
                或直接点击地图上的城市查看相册
              </p>
            </GlassCard>

            {/* Add places */}
            <GlassCard className="p-4">
              <h3 className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-3">我的地点</h3>
              <button
                onClick={() => setShowAddPlace(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-pink-700 bg-white/40 border border-pink-200 hover:bg-pink-50 transition"
              >
                <span>📍</span>
                <span>添加国家 / 城市</span>
              </button>
              <p className="mt-2 text-[10px] text-pink-400 text-center">
                添加的城市将显示在地球上
              </p>
            </GlassCard>

            {/* Search */}
            <SearchPanel />

            {/* Filter */}
            <FilterPanel />

            {/* Globe controls */}
            <GlobeControlPanel />

            {/* Travel timeline */}
            <TimelinePanel />

            {/* Route replay */}
            <ReplayPanel />

            {/* Music & SFX */}
            <MusicPanel />

            <div className="flex-1" />

            {/* Sign out */}
            <GlassCard className="p-3">
              <button
                onClick={handleSignOut}
                className="w-full rounded-xl py-2 text-sm text-pink-500 hover:text-rose-600 hover:bg-rose-50/50 transition"
              >
                退出登录
              </button>
            </GlassCard>

            <AuthorCredit className="pb-1" />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
