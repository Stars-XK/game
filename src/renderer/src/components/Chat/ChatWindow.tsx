import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatSession, ChatMessage } from '@shared/types/chat'
import { useTTS } from '../../hooks/useTTS'
import './ChatWindow.css'

interface ChatWindowProps {
  onClose: () => void
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { speak, stop, isSpeaking, config: ttsConfig, setConfig: setTTSConfig, voices } = useTTS()
  const [showTTSSettings, setShowTTSSettings] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages])

  const loadHistory = async () => {
    try {
      const history = await window.electronAPI.chat.getHistory()
      setSessions(history.sessions)

      if (history.currentSessionId) {
        const session = history.sessions.find((s: ChatSession) => s.id === history.currentSessionId)
        if (session) {
          setCurrentSession(session)
          return
        }
      }

      const newSession = await window.electronAPI.chat.newSession()
      setCurrentSession(newSession)
      setSessions([newSession, ...history.sessions])
    } catch (error) {
      console.error('Failed to load chat history:', error)
      const newSession = await window.electronAPI.chat.newSession()
      setCurrentSession(newSession)
    }
  }

  const saveSession = useCallback(async (session: ChatSession) => {
    try {
      const saved = await window.electronAPI.chat.saveHistory(session)
      setCurrentSession(saved)
      setSessions((prev) => {
        const index = prev.findIndex((s) => s.id === saved.id)
        if (index >= 0) {
          const newSessions = [...prev]
          newSessions[index] = saved
          return newSessions
        }
        return [saved, ...prev]
      })
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSession) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    const updatedMessages = [...currentSession.messages, userMessage]
    setInput('')
    setIsLoading(true)

    try {
      const config = await window.electronAPI.config.get()
      const messages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      messages.unshift({
        role: 'system',
        content: `你是${config.petName || '小萌'}，一个可爱的桌宠。你的主人是${config.ownerName || '主人'}。请用可爱、亲切的语气回复，保持回复简洁有趣。`,
      })

      const response = await window.electronAPI.ai.chat(messages)

      const responseContent = response.success
        ? (response.message || '...')
        : (response.error || '抱歉，我无法回应')

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      const title =
        currentSession.messages.length === 0
          ? input.trim().slice(0, 20) + (input.trim().length > 20 ? '...' : '')
          : currentSession.title

      await saveSession({
        ...currentSession,
        title,
        messages: finalMessages,
        updatedAt: Date.now(),
      })

      if (response.success && response.message) {
        speak(response.message)
      }

      await window.electronAPI.achievement.incrementStat('chatCount')
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        timestamp: Date.now(),
      }

      await saveSession({
        ...currentSession,
        messages: [...updatedMessages, errorMessage],
        updatedAt: Date.now(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSession = async () => {
    const newSession = await window.electronAPI.chat.newSession()
    setCurrentSession(newSession)
    setSessions((prev) => [newSession, ...prev])
    setShowHistory(false)
  }

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session)
    setShowHistory(false)
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await window.electronAPI.chat.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSession?.id === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        if (remaining.length > 0) {
          setCurrentSession(remaining[0])
        } else {
          handleNewSession()
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
          title="历史记录"
        >
          📋
        </button>
        <span className="chat-title">{currentSession?.title || '聊天'}</span>
        <button
          className={`tts-toggle ${ttsConfig.enabled ? 'active' : ''}`}
          onClick={() => setShowTTSSettings(!showTTSSettings)}
          title="语音设置"
        >
          {isSpeaking ? '🔊' : ttsConfig.enabled ? '🔈' : '🔇'}
        </button>
        <button className="chat-close" onClick={onClose}>
          ×
        </button>
      </div>

      {showTTSSettings && (
        <div className="tts-settings">
          <div className="tts-setting-item">
            <label>语音</label>
            <select
              value={ttsConfig.voice}
              onChange={(e) => setTTSConfig({ voice: e.target.value })}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
          <div className="tts-setting-item">
            <label>语速: {ttsConfig.rate.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsConfig.rate}
              onChange={(e) => setTTSConfig({ rate: parseFloat(e.target.value) })}
            />
          </div>
          <div className="tts-setting-item">
            <label>音调: {ttsConfig.pitch.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsConfig.pitch}
              onChange={(e) => setTTSConfig({ pitch: parseFloat(e.target.value) })}
            />
          </div>
          <div className="tts-setting-item tts-toggle-row">
            <label>启用语音</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={ttsConfig.enabled}
                onChange={(e) => setTTSConfig({ enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          {isSpeaking && (
            <button className="tts-stop-btn" onClick={stop}>
              停止播放
            </button>
          )}
        </div>
      )}

      {showHistory && (
        <div className="chat-history">
          <div className="history-header">
            <span>历史记录</span>
            <button className="new-chat-btn" onClick={handleNewSession}>
              + 新对话
            </button>
          </div>
          <div className="history-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => handleSelectSession(session)}
              >
                <div className="history-item-title">{session.title}</div>
                <div className="history-item-date">{formatDate(session.updatedAt)}</div>
                <button
                  className="history-item-delete"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages" ref={messagesEndRef}>
        {currentSession?.messages.length === 0 && (
          <div className="chat-message assistant">
            <div className="message-content">你好呀！我是你的桌宠，有什么想聊的吗？</div>
          </div>
        )}
        {currentSession?.messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.role}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-time">{formatTime(message.timestamp)}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-content typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button className="send-button" onClick={handleSend} disabled={!input.trim() || isLoading}>
          发送
        </button>
      </div>
    </div>
  )
}
