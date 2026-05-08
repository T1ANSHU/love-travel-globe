import { create } from 'zustand'

export interface SelectedPlace {
  type: 'country' | 'city' | 'landmark'
  countryId: string
  cityId?: string
  landmarkId?: string
  name: string
}

export interface FlyToRequest {
  lat: number
  lng: number
  altitude: number
  ts: number  // unique timestamp so repeated same-location requests fire
}

export interface HoveredCity {
  cityId: string
  x: number  // viewport px, used for preview card positioning
  y: number
}

interface GlobeState {
  cameraAltitude: number
  autoRotate: boolean
  selectedPlace: SelectedPlace | null
  showUploadModal: boolean
  showAllAlbums: boolean
  showAddPlace: boolean
  flyToRequest: FlyToRequest | null
  showArcs: boolean
  hoveredCity: HoveredCity | null
  setCameraAltitude: (alt: number) => void
  setAutoRotate: (v: boolean) => void
  setSelectedPlace: (place: SelectedPlace | null) => void
  setShowUploadModal: (v: boolean) => void
  setShowAllAlbums: (v: boolean) => void
  setShowAddPlace: (v: boolean) => void
  setFlyToRequest: (req: Omit<FlyToRequest, 'ts'> | null) => void
  setShowArcs: (v: boolean) => void
  setHoveredCity: (v: HoveredCity | null) => void
}

export const useGlobeStore = create<GlobeState>((set) => ({
  cameraAltitude: 2.5,
  autoRotate: true,
  selectedPlace: null,
  showUploadModal: false,
  showAllAlbums: false,
  showAddPlace: false,
  flyToRequest: null,
  showArcs: false,
  hoveredCity: null,
  setCameraAltitude: (alt) => set({ cameraAltitude: alt }),
  setAutoRotate: (v) => set({ autoRotate: v }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setShowUploadModal: (v) => set({ showUploadModal: v }),
  setShowAllAlbums: (v) => set({ showAllAlbums: v }),
  setShowAddPlace: (v) => set({ showAddPlace: v }),
  setFlyToRequest: (req) => set({
    flyToRequest: req ? { ...req, ts: Date.now() } : null,
  }),
  setShowArcs: (v) => set({ showArcs: v }),
  setHoveredCity: (v) => set({ hoveredCity: v }),
}))
