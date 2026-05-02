import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../ipc/channels'
import { getConfig } from '../ipc/handlers/config'
import { 
  PersonalityType, 
  CharacterPersonality, 
  EmotionalState,
  PERSONALITY_CONFIGS, 
  DEFAULT_EMOTIONAL_STATE,
  getPersonalityPrompt,
  getEmotionalPrompt
} from '@shared/data/personality'
import {
  getMemories,
  getRelevantMemories,
  getMemoryContext,
  addMemory,
  addConversationSummary,
  setUserPreference,
  checkTodaySpecial,
} from './memory'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AIResponse {
  success: boolean
  message?: string
  error?: string
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

let currentEmotionalState: EmotionalState = { ...DEFAULT_EMOTIONAL_STATE }

export function getEmotionalState(): EmotionalState {
  return { ...currentEmotionalState }
}

export function updateEmotionalState(updates: Partial<EmotionalState>): EmotionalState {
  currentEmotionalState = {
    ...currentEmotionalState,
    ...updates,
  }
  
  for (const key of Object.keys(currentEmotionalState)) {
    const k = key as keyof EmotionalState
    currentEmotionalState[k] = Math.max(0, Math.min(100, currentEmotionalState[k]))
  }
  
  return { ...currentEmotionalState }
}

export function processUserInteraction(interactionType: 'chat' | 'pet' | 'feed' | 'game' | 'ignore'): void {
  switch (interactionType) {
    case 'chat':
      updateEmotionalState({
        happiness: Math.min(100, currentEmotionalState.happiness + 5),
        affection: Math.min(100, currentEmotionalState.affection + 3),
        excitement: Math.min(100, currentEmotionalState.excitement + 2),
      })
      break
    case 'pet':
      updateEmotionalState({
        happiness: Math.min(100, currentEmotionalState.happiness + 10),
        affection: Math.min(100, currentEmotionalState.affection + 5),
        excitement: Math.min(100, currentEmotionalState.excitement + 5),
      })
      break
    case 'feed':
      updateEmotionalState({
        happiness: Math.min(100, currentEmotionalState.happiness + 8),
        hunger: Math.min(100, currentEmotionalState.hunger + 30),
      })
      break
    case 'game':
      updateEmotionalState({
        happiness: Math.min(100, currentEmotionalState.happiness + 7),
        excitement: Math.min(100, currentEmotionalState.excitement + 10),
        tiredness: Math.min(100, currentEmotionalState.tiredness + 5),
      })
      break
    case 'ignore':
      updateEmotionalState({
        happiness: Math.max(0, currentEmotionalState.happiness - 5),
        affection: Math.max(0, currentEmotionalState.affection - 2),
      })
      break
  }
}

function extractPreferencesFromMessage(message: string): void {
  const preferencePatterns = [
    { pattern: /我喜欢(.+)/, key: 'likes' },
    { pattern: /我不喜欢(.+)/, key: 'dislikes' },
    { pattern: /我最爱(.+)/, key: 'favorite' },
    { pattern: /我叫(.+)/, key: 'name' },
    { pattern: /我的生日是(.+)/, key: 'birthday' },
  ]
  
  for (const { pattern, key } of preferencePatterns) {
    const match = message.match(pattern)
    if (match) {
      setUserPreference(key, match[1].trim())
    }
  }
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<AIResponse> {
  const config = getConfig()

  if (!config.openaiApiKey) {
    return {
      success: false,
      error: '请先配置 OpenAI API Key',
    }
  }

  try {
    const personalityType = ((config as any).personalityType || 'cheerful') as PersonalityType
    const personality = PERSONALITY_CONFIGS[personalityType]
    
    const memoryContext = getMemoryContext()
    const emotionalPrompt = getEmotionalPrompt(currentEmotionalState)
    const todaySpecial = checkTodaySpecial()
    
    const systemPrompt = `你是${config.petName || '小萌'}，一个可爱的桌宠女友。你的主人是${config.ownerName || '主人'}。

${getPersonalityPrompt(personality)}

${emotionalPrompt}

${memoryContext}

${todaySpecial ? `今天是特殊的日子：${todaySpecial.description}，记得在对话中提及！` : ''}

请用可爱、亲切的语气回复，保持回复简洁有趣，符合你的性格特点。记住你们之间的关系，并在对话中自然地表达情感。`

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (lastUserMessage) {
      extractPreferencesFromMessage(lastUserMessage.content)
      
      const relevantMemories = getRelevantMemories(lastUserMessage.content)
      if (relevantMemories.length > 0) {
        addMemory({
          type: 'conversation',
          content: `用户说：${lastUserMessage.content.slice(0, 100)}`,
          importance: 5,
        })
      }
    }

    const messagesWithContext = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    const response = await fetch(config.openaiBaseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messagesWithContext,
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    const data: OpenAIResponse = await response.json() as OpenAIResponse
    const replyContent = data.choices?.[0]?.message?.content || ''

    if (replyContent) {
      processUserInteraction('chat')
      
      if (messages.length > 4) {
        const summary = `讨论了${lastUserMessage?.content.slice(0, 30)}...`
        addConversationSummary(summary)
      }
    }

    return {
      success: true,
      message: replyContent,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '请求失败',
    }
  }
}

export function registerAIHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.AI.CHAT, async (_event, messages: ChatMessage[]) => {
    return await sendChatMessage(messages)
  })
  
  ipcMain.handle('ai:get-emotional-state', () => {
    return getEmotionalState()
  })
  
  ipcMain.handle('ai:update-emotional-state', (_event, updates: Partial<EmotionalState>) => {
    return updateEmotionalState(updates)
  })
  
  ipcMain.handle('ai:process-interaction', (_event, type: 'chat' | 'pet' | 'feed' | 'game' | 'ignore') => {
    processUserInteraction(type)
    return getEmotionalState()
  })
  
  ipcMain.handle('ai:get-memories', (_event, limit?: number) => {
    return getMemories(limit)
  })
}
