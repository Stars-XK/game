import Store from 'electron-store'
import { Memory } from '@shared/data/personality'

interface MemoryStore {
  memories: Memory[]
  userPreferences: Record<string, string | number | boolean>
  conversationSummary: string[]
  importantDates: Array<{
    date: string
    description: string
    type: 'birthday' | 'anniversary' | 'special'
  }>
}

const store = new Store<MemoryStore>({
  defaults: {
    memories: [],
    userPreferences: {},
    conversationSummary: [],
    importantDates: [],
  },
})

const MAX_MEMORIES = 100
const MAX_SUMMARIES = 50

export function addMemory(memory: Omit<Memory, 'id' | 'timestamp' | 'lastAccessed'>): Memory {
  const memories = store.get('memories')
  
  const newMemory: Memory = {
    ...memory,
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    lastAccessed: Date.now(),
  }
  
  const updatedMemories = [newMemory, ...memories]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, MAX_MEMORIES)
  
  store.set('memories', updatedMemories)
  return newMemory
}

export function getMemories(limit?: number): Memory[] {
  const memories = store.get('memories')
  const now = Date.now()
  
  const updated = memories.map(m => ({
    ...m,
    lastAccessed: now,
  }))
  store.set('memories', updated)
  
  return updated.slice(0, limit || 10)
}

export function getRelevantMemories(context: string): Memory[] {
  const memories = store.get('memories')
  const contextLower = context.toLowerCase()
  
  const relevant = memories
    .filter(m => {
      const contentLower = m.content.toLowerCase()
      return contextLower.includes(contentLower) || 
             contentLower.includes(contextLower) ||
             m.type === 'preference'
    })
    .sort((a, b) => {
      const scoreA = a.importance + (Date.now() - a.lastAccessed) / 86400000
      const scoreB = b.importance + (Date.now() - b.lastAccessed) / 86400000
      return scoreB - scoreA
    })
    .slice(0, 5)
  
  const now = Date.now()
  relevant.forEach(m => {
    const idx = memories.findIndex(mem => mem.id === m.id)
    if (idx >= 0) {
    memories[idx].lastAccessed = now
    }
  })
  store.set('memories', memories)
  
  return relevant
}

export function setUserPreference(key: string, value: string | number | boolean): void {
  const prefs = store.get('userPreferences')
  prefs[key] = value
  store.set('userPreferences', prefs)
  
  addMemory({
    type: 'preference',
    content: `用户偏好：${key} = ${value}`,
    importance: 8,
  })
}

export function getUserPreference(key: string): string | number | boolean | undefined {
  return store.get('userPreferences')[key]
}

export function getAllUserPreferences(): Record<string, string | number | boolean> {
  return store.get('userPreferences')
}

export function addConversationSummary(summary: string): void {
  const summaries = store.get('conversationSummary')
  summaries.unshift(summary)
  store.set('conversationSummary', summaries.slice(0, MAX_SUMMARIES))
}

export function getConversationSummaries(limit?: number): string[] {
  return store.get('conversationSummary').slice(0, limit || 10)
}

export function addImportantDate(date: string, description: string, type: 'birthday' | 'anniversary' | 'special'): void {
  const dates = store.get('importantDates')
  dates.push({ date, description, type })
  store.set('importantDates', dates)
}

export function getImportantDates(): MemoryStore['importantDates'] {
  return store.get('importantDates')
}

export function checkTodaySpecial(): MemoryStore['importantDates'][0] | null {
  const today = new Date()
  const todayStr = `${today.getMonth() + 1}-${today.getDate()}`
  
  const dates = store.get('importantDates')
  return dates.find(d => d.date === todayStr) || null
}

export function getMemoryContext(): string {
  const prefs = getAllUserPreferences()
  const summaries = getConversationSummaries(3)
  const todaySpecial = checkTodaySpecial()
  
  let context = ''
  
  if (Object.keys(prefs).length > 0) {
    context += '用户偏好：\n'
    for (const [key, value] of Object.entries(prefs)) {
      context += `- ${key}: ${value}\n`
    }
  }
  
  if (summaries.length > 0) {
    context += '\n最近的对话摘要：\n'
    summaries.forEach((s, i) => {
      context += `${i + 1}. ${s}\n`
    })
  }
  
  if (todaySpecial) {
    context += `\n今天是特殊的日子：${todaySpecial.description}\n`
  }
  
  return context
}

export function clearOldMemories(): void {
  const memories = store.get('memories')
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  
  const filtered = memories.filter(m => 
    m.importance >= 7 || m.timestamp > thirtyDaysAgo
  )
  
  store.set('memories', filtered)
}
