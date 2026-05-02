import { ipcMain } from 'electron'
import Store from 'electron-store'
import { IPC_CHANNELS } from '../channels'
import { ChatHistory, ChatSession, ChatMessage } from '@shared/types/chat'

const store = new Store<{ chatHistory: ChatHistory }>()

const DEFAULT_HISTORY: ChatHistory = {
  sessions: [],
  currentSessionId: null,
}

function getChatHistory(): ChatHistory {
  return store.get('chatHistory', DEFAULT_HISTORY)
}

function setChatHistory(history: ChatHistory): void {
  store.set('chatHistory', history)
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function registerChatHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CHAT.GET_HISTORY, (): ChatHistory => {
    return getChatHistory()
  })

  ipcMain.handle(IPC_CHANNELS.CHAT.SAVE_HISTORY, (_event, session: ChatSession): ChatSession => {
    const history = getChatHistory()
    const existingIndex = history.sessions.findIndex((s) => s.id === session.id)

    if (existingIndex >= 0) {
      history.sessions[existingIndex] = {
        ...session,
        updatedAt: Date.now(),
      }
    } else {
      history.sessions.push({
        ...session,
        updatedAt: Date.now(),
      })
    }

    history.currentSessionId = session.id
    setChatHistory(history)

    return history.sessions.find((s) => s.id === session.id)!
  })

  ipcMain.handle(IPC_CHANNELS.CHAT.CLEAR_HISTORY, (): void => {
    setChatHistory(DEFAULT_HISTORY)
  })

  ipcMain.handle(IPC_CHANNELS.CHAT.NEW_SESSION, (_event, title?: string): ChatSession => {
    const history = getChatHistory()
    const newSession: ChatSession = {
      id: generateId(),
      title: title || `对话 ${history.sessions.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    history.sessions.unshift(newSession)
    history.currentSessionId = newSession.id
    setChatHistory(history)

    return newSession
  })

  ipcMain.handle(IPC_CHANNELS.CHAT.DELETE_SESSION, (_event, sessionId: string): void => {
    const history = getChatHistory()
    history.sessions = history.sessions.filter((s) => s.id !== sessionId)

    if (history.currentSessionId === sessionId) {
      history.currentSessionId = history.sessions[0]?.id || null
    }

    setChatHistory(history)
  })
}
