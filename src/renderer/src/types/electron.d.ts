import { ChatSession } from '@shared/types/chat'

interface ElectronAPI {
  config: {
    get: () => Promise<Record<string, unknown>>
    set: (config: Record<string, unknown>) => Promise<void>
    reset: () => Promise<void>
  }
  window: {
    show: () => Promise<void>
    hide: () => Promise<void>
    setAlwaysOnTop: (value: boolean) => Promise<void>
    setPosition: (x: number, y: number) => Promise<void>
  }
  ai: {
    chat: (messages: Array<{ role: string; content: string }>) => Promise<string>
  }
  screen: {
    capture: () => Promise<{
      dataUrl: string
      width: number
      height: number
      timestamp: number
    } | null>
    analyzeScene: () => Promise<{
      scene: string
      confidence: number
      keywords: string[]
      timestamp: number
    }>
  }
  achievement: {
    getAll: () => Promise<{
      progress: Record<string, unknown>
      stats: Record<string, number>
    }>
    getProgress: () => Promise<Record<string, unknown>>
    getStats: () => Promise<Record<string, number>>
    updateStat: (stat: string, value: number) => Promise<unknown[]>
    incrementStat: (stat: string) => Promise<unknown[]>
  }
  chat: {
    getHistory: () => Promise<{
      sessions: ChatSession[]
      currentSessionId: string | null
    }>
    saveHistory: (session: ChatSession) => Promise<ChatSession>
    clearHistory: () => Promise<void>
    newSession: (title?: string) => Promise<ChatSession>
    deleteSession: (sessionId: string) => Promise<void>
  }
  data: {
    export: () => Promise<{ success: boolean; message: string; filePath?: string }>
    import: () => Promise<{ success: boolean; message: string }>
    reset: () => Promise<{ success: boolean; message: string }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
