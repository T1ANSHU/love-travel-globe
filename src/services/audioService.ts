// Sound effect names — add audio files in UI Polish phase
export type SfxName =
  | 'city-hover'
  | 'city-click'
  | 'album-open'
  | 'album-close'
  | 'upload-success'
  | 'photo-delete'

// Map sfx names to file paths — populate in UI Polish phase
const SFX_FILES: Partial<Record<SfxName, string>> = {
  // 'city-hover':      '/audio/sfx/hover.mp3',
  // 'city-click':      '/audio/sfx/click.mp3',
  // 'album-open':      '/audio/sfx/open.mp3',
  // 'album-close':     '/audio/sfx/close.mp3',
  // 'upload-success':  '/audio/sfx/success.mp3',
  // 'photo-delete':    '/audio/sfx/delete.mp3',
}

class AudioService {
  private musicEl: HTMLAudioElement | null = null
  private _musicVolume = 0.5   // 0–1
  private _sfxVolume = 0.7     // 0–1
  private _sfxEnabled = true
  private sfxCache = new Map<SfxName, HTMLAudioElement>()

  // ── Background music ────────────────────────────────────────────
  loadTrack(url: string) {
    if (this.musicEl) { this.musicEl.pause(); this.musicEl.src = '' }
    const el = new Audio(url)
    el.loop = true
    el.volume = this._musicVolume
    this.musicEl = el
  }

  play() {
    this.musicEl?.play().catch(() => { /* browser autoplay policy */ })
  }

  pause() { this.musicEl?.pause() }

  get isPlaying(): boolean {
    return this.musicEl ? !this.musicEl.paused : false
  }

  setMusicVolume(v: number) {  // 0–1
    this._musicVolume = v
    if (this.musicEl) this.musicEl.volume = v
  }

  // ── Sound effects ───────────────────────────────────────────────
  setSfxEnabled(enabled: boolean) { this._sfxEnabled = enabled }

  setSfxVolume(v: number) {  // 0–1
    this._sfxVolume = v
    for (const el of this.sfxCache.values()) el.volume = v
  }

  playSfx(name: SfxName) {
    if (!this._sfxEnabled) return
    const url = SFX_FILES[name]
    if (!url) return   // no file registered yet — silent no-op
    let el = this.sfxCache.get(name)
    if (!el) {
      el = new Audio(url)
      el.volume = this._sfxVolume
      this.sfxCache.set(name, el)
    }
    el.currentTime = 0
    el.play().catch(() => {})
  }
}

export const audioService = new AudioService()
