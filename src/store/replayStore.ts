import { create } from 'zustand'

export type ReplaySpeed = 0.5 | 1 | 2

interface ReplayState {
  playing: boolean
  currentIndex: number
  total: number
  speed: ReplaySpeed
  setPlaying: (v: boolean) => void
  setCurrentIndex: (i: number) => void
  setTotal: (n: number) => void
  setSpeed: (s: ReplaySpeed) => void
  reset: () => void
}

export const useReplayStore = create<ReplayState>((set) => ({
  playing: false,
  currentIndex: 0,
  total: 0,
  speed: 1,
  setPlaying: (v) => set({ playing: v }),
  setCurrentIndex: (i) => set({ currentIndex: i }),
  setTotal: (n) => set({ total: n }),
  setSpeed: (s) => set({ speed: s }),
  reset: () => set({ playing: false, currentIndex: 0 }),
}))
