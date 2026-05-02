/// <reference types="vite/client" />

import { AppConfig } from '@shared/types/config'

interface ElectronAPI {
  config: {
    get: () => Promise<AppConfig>
    set: (config: Partial<AppConfig>) => Promise<AppConfig>
    reset: () => Promise<AppConfig>
  }
  window: {
    show: () => Promise<void>
    hide: () => Promise<void>
    setAlwaysOnTop: (value: boolean) => Promise<void>
    setPosition: (x: number, y: number) => Promise<void>
  }
  ai: {
    chat: (messages: Array<{ role: string; content: string }>) => Promise<{
      success: boolean
      message?: string
      error?: string
    }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
