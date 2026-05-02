export interface TTSConfig {
  enabled: boolean
  voice: string
  rate: number
  pitch: number
  volume: number
}

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  enabled: true,
  voice: '',
  rate: 1,
  pitch: 1,
  volume: 1,
}
