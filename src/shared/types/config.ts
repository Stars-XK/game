export interface AppConfig {
  petName: string
  ownerName: string
  openaiApiKey: string
  openaiBaseUrl: string
  model: string
  language: string
  theme: 'light' | 'dark' | 'auto'
  autoStart: boolean
  alwaysOnTop: boolean
  windowPosition?: { x: number; y: number }
  petModelId: 'character' | 'xiaomeng'
  interactionRange: 'screen' | 'window'
  debugMode: boolean
  appearance: PetAppearanceConfig
}

export interface PetAppearanceConfig {
  bodyColor: string
  bodyColorSecondary: string
  hairColor: string
  eyeColor: string
  clothes: {
    hair: string | null
    top: string | null
    bottom: string | null
    dress: string | null
    shoes: string | null
    accessory: string | null
  }
}

const DEFAULT_APPEARANCE: PetAppearanceConfig = {
  bodyColor: '#ffe4c4',
  bodyColorSecondary: '#ffd4b4',
  hairColor: '#4a3728',
  eyeColor: '#6b5b95',
  clothes: {
    hair: null,
    top: null,
    bottom: null,
    dress: null,
    shoes: null,
    accessory: null,
  },
}

export const DEFAULT_CONFIG: AppConfig = {
  petName: '小萌',
  ownerName: '主人',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  language: 'zh-CN',
  theme: 'auto',
  autoStart: false,
  alwaysOnTop: true,
  windowPosition: undefined,
  petModelId: 'character',
  interactionRange: 'screen',
  debugMode: false,
  appearance: DEFAULT_APPEARANCE,
}
