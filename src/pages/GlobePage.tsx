import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GlobeScene } from '../components/Globe/GlobeScene'
import { CityHoverPreview } from '../components/Globe/CityHoverPreview'
import { PlaceAchievement, type AchievementPlace } from '../components/Globe/PlaceAchievement'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { IntroAnimation } from '../components/IntroAnimation/IntroAnimation'
import { AlbumModal } from '../components/Album/AlbumModal'
import { AddPlaceModal } from '../components/Globe/AddPlaceModal'
import { useGlobeStore } from '../store/globeStore'
import { useUserPhotos } from '../hooks/useUserPhotos'
import { useUserPlaces } from '../hooks/useUserPlaces'
import { useSettings } from '../hooks/useSettings'
import { CoupleStoryPanel } from '../components/CoupleStory/CoupleStoryPanel'

export function GlobePage() {
  const [introComplete, setIntroComplete] = useState(false)
  // Local state — does not touch globeStore, so GlobeScene's selective subscriptions
  // are unaffected; no arcsData / pointsData re-binding occurs.
  const [achievementPlace, setAchievementPlace] = useState<AchievementPlace | null>(null)

  useUserPhotos()   // seed photo cache
  useUserPlaces()   // seed user_places cache
  useSettings()     // load user settings (autoRotate, music, sfx)

  const selectedPlace = useGlobeStore((s) => s.selectedPlace)
  const showUploadModal = useGlobeStore((s) => s.showUploadModal)
  const showAllAlbums = useGlobeStore((s) => s.showAllAlbums)
  const showAddPlace = useGlobeStore((s) => s.showAddPlace)
  const setSelectedPlace = useGlobeStore((s) => s.setSelectedPlace)
  const setShowUploadModal = useGlobeStore((s) => s.setShowUploadModal)
  const setShowAllAlbums = useGlobeStore((s) => s.setShowAllAlbums)
  const setShowAddPlace = useGlobeStore((s) => s.setShowAddPlace)

  const albumModalOpen = selectedPlace !== null || showUploadModal || showAllAlbums

  const closeAlbumModal = () => {
    setSelectedPlace(null)
    setShowUploadModal(false)
    setShowAllAlbums(false)
  }

  // Upload form is shown only via the "上传照片" button (no place selected, not "all albums")
  const initialView = showUploadModal && !selectedPlace && !showAllAlbums ? 'upload' : 'album'

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-dreamy select-none">
      {/* Dreamy background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />
      </div>

      {/* Intro animation overlay */}
      {!introComplete && <IntroAnimation onComplete={() => setIntroComplete(true)} />}

      {/* Globe — fills entire viewport */}
      <main className="absolute inset-0 z-10">
        <GlobeScene />
      </main>

      {/* City hover preview overlay — sibling of GlobeScene, not a child */}
      <CityHoverPreview />

      {/* Couple story panel — left side */}
      <CoupleStoryPanel />

      {/* Sidebar */}
      <Sidebar />

      {/* Album / upload modal */}
      <AnimatePresence>
        {albumModalOpen && (
          <AlbumModal
            key="album-modal"
            place={selectedPlace}
            initialView={initialView}
            onClose={closeAlbumModal}
          />
        )}
      </AnimatePresence>

      {/* Add place modal */}
      <AnimatePresence>
        {showAddPlace && (
          <AddPlaceModal
            key="add-place-modal"
            onClose={() => setShowAddPlace(false)}
            onPlaceAdded={(place) => setAchievementPlace(place)}
          />
        )}
      </AnimatePresence>

      {/* Achievement animation — appears when a new place is added */}
      {achievementPlace && (
        <PlaceAchievement
          key={`${achievementPlace.kind}-${achievementPlace.name}`}
          place={achievementPlace}
          onComplete={() => setAchievementPlace(null)}
        />
      )}

      {/* Bottom hint bar */}
      <div className="pointer-events-none fixed bottom-6 left-0 right-0 flex justify-center z-10">
        <div className="glass-card px-6 py-2">
          <p className="text-sm font-medium text-pink-600">
            Our Memory Globe 💕 点击城市点位探索旅行相册
          </p>
        </div>
      </div>
    </div>
  )
}
