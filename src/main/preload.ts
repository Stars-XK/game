import { contextBridge, ipcRenderer } from 'electron'

const IPC_CHANNELS = {
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
    RESET: 'config:reset',
  },
  AI: {
    CHAT: 'ai:chat',
    CHAT_STREAM: 'ai:chat-stream',
    STOP: 'ai:stop',
  },
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
    SHOW: 'window:show',
    HIDE: 'window:hide',
    SET_ALWAYS_ON_TOP: 'window:set-always-on-top',
    SET_POSITION: 'window:set-position',
    GET_POSITION: 'window:get-position',
    SET_MOUSE_PASSTHROUGH: 'window:set-mouse-passthrough',
  },
  PET: {
    GET_STATE: 'pet:get-state',
    SET_STATE: 'pet:set-state',
  },
  SCREEN: {
    CAPTURE: 'screen:capture',
    ANALYZE_SCENE: 'screen:analyze-scene',
  },
  ACHIEVEMENT: {
    GET_ALL: 'achievement:get-all',
    GET_PROGRESS: 'achievement:get-progress',
    GET_STATS: 'achievement:get-stats',
    UPDATE_STAT: 'achievement:update-stat',
    INCREMENT_STAT: 'achievement:increment-stat',
  },
  CHAT: {
    GET_HISTORY: 'chat:get-history',
    SAVE_HISTORY: 'chat:save-history',
    CLEAR_HISTORY: 'chat:clear-history',
    NEW_SESSION: 'chat:new-session',
    DELETE_SESSION: 'chat:delete-session',
  },
  DATA: {
    EXPORT: 'data:export',
    IMPORT: 'data:import',
    RESET: 'data:reset',
  },
} as const

interface ChatSession {
  id: string
  title: string
  messages: Array<{ role: string; content: string; timestamp: number }>
  createdAt: number
  updatedAt: number
}

export const electronAPI = {
  config: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.GET),
    set: (config: Record<string, unknown>) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.SET, config),
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.RESET),
  },
  window: {
    show: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SHOW),
    hide: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.HIDE),
    setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_ALWAYS_ON_TOP, value),
    setPosition: (x: number, y: number) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_POSITION, x, y),
    getPosition: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.GET_POSITION),
    setMousePassthrough: (enabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_MOUSE_PASSTHROUGH, enabled),
  },
  ai: {
    chat: (messages: Array<{ role: string; content: string }>) =>
      ipcRenderer.invoke(IPC_CHANNELS.AI.CHAT, messages),
    getEmotionalState: () => ipcRenderer.invoke('ai:get-emotional-state'),
    updateEmotionalState: (updates: Record<string, number>) =>
      ipcRenderer.invoke('ai:update-emotional-state', updates),
    processInteraction: (type: string) =>
      ipcRenderer.invoke('ai:process-interaction', type),
    getMemories: (limit?: number) =>
      ipcRenderer.invoke('ai:get-memories', limit),
  },
  screen: {
    capture: () => ipcRenderer.invoke(IPC_CHANNELS.SCREEN.CAPTURE),
    analyzeScene: () => ipcRenderer.invoke(IPC_CHANNELS.SCREEN.ANALYZE_SCENE),
  },
  achievement: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.ACHIEVEMENT.GET_ALL),
    getProgress: () => ipcRenderer.invoke(IPC_CHANNELS.ACHIEVEMENT.GET_PROGRESS),
    getStats: () => ipcRenderer.invoke(IPC_CHANNELS.ACHIEVEMENT.GET_STATS),
    updateStat: (stat: string, value: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.ACHIEVEMENT.UPDATE_STAT, stat, value),
    incrementStat: (stat: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.ACHIEVEMENT.INCREMENT_STAT, stat),
  },
  chat: {
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CHAT.GET_HISTORY),
    saveHistory: (session: ChatSession) =>
      ipcRenderer.invoke(IPC_CHANNELS.CHAT.SAVE_HISTORY, session),
    clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CHAT.CLEAR_HISTORY),
    newSession: (title?: string) => ipcRenderer.invoke(IPC_CHANNELS.CHAT.NEW_SESSION, title),
    deleteSession: (sessionId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CHAT.DELETE_SESSION, sessionId),
  },
  data: {
    export: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.EXPORT),
    import: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.IMPORT),
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.RESET),
  },
  events: {
    onOpenSettings: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('open-settings', listener)
      return () => {
        ipcRenderer.removeListener('open-settings', listener)
      }
    },
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
