export interface SoundConfig {
  name: string
  url: string
  volume?: number
}

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private volume: number = 0.5

  load(configs: SoundConfig[]): void {
    configs.forEach((config) => {
      const audio = new Audio(config.url)
      audio.volume = config.volume ?? this.volume
      audio.preload = 'auto'
      this.sounds.set(config.name, audio)
    })
  }

  loadFromBase64(name: string, base64Data: string, mimeType: string = 'audio/mp3'): void {
    const audio = new Audio(`data:${mimeType};base64,${base64Data}`)
    audio.volume = this.volume
    audio.preload = 'auto'
    this.sounds.set(name, audio)
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((audio) => {
      audio.volume = this.volume
    })
  }

  play(name: string, options?: { volume?: number; loop?: boolean }): HTMLAudioElement | null {
    if (!this.enabled) return null

    let audio = this.sounds.get(name)
    if (!audio) {
      console.warn(`Sound "${name}" not found`)
      return null
    }

    const volume = options?.volume ?? this.volume
    const loop = options?.loop ?? false

    if (audio.paused) {
      audio.currentTime = 0
    } else {
      audio = audio.cloneNode() as HTMLAudioElement
    }

    audio.volume = volume
    audio.loop = loop

    audio.play().catch((error) => {
      console.warn(`Failed to play sound "${name}":`, error)
    })

    return audio
  }

  stop(name: string): void {
    const audio = this.sounds.get(name)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  stopAll(): void {
    this.sounds.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
  }
}

export const soundManager = new SoundManager()

export const SOUNDS = {
  CLICK: 'click',
  FEED: 'feed',
  PET: 'pet',
  GAME_WIN: 'gameWin',
  GAME_LOSE: 'gameLose',
  ACHIEVEMENT: 'achievement',
  NOTIFICATION: 'notification',
} as const

export function useSound() {
  const playClick = () => soundManager.play(SOUNDS.CLICK)
  const playFeed = () => soundManager.play(SOUNDS.FEED)
  const playPet = () => soundManager.play(SOUNDS.PET)
  const playGameWin = () => soundManager.play(SOUNDS.GAME_WIN)
  const playGameLose = () => soundManager.play(SOUNDS.GAME_LOSE)
  const playAchievement = () => soundManager.play(SOUNDS.ACHIEVEMENT)
  const playNotification = () => soundManager.play(SOUNDS.NOTIFICATION)

  return {
    playClick,
    playFeed,
    playPet,
    playGameWin,
    playGameLose,
    playAchievement,
    playNotification,
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    stopAll: () => soundManager.stopAll(),
  }
}
