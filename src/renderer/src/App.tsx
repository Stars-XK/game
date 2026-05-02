import { useState, useCallback, useEffect, useRef } from 'react'
import { VRMCanvas } from './components/Pet/VRMCanvas'
import { ChatWindow } from './components/Chat/ChatWindow'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { DressUpPanel } from './components/DressUp/DressUpPanel'
import { GameSelector } from './components/Game/GameSelector'
import { AchievementPanel } from './components/Achievement/AchievementPanel'
import { OnboardingGuide } from './components/common/OnboardingGuide'
import { PetStatusPanel } from './components/Pet/PetStatusPanel'
import { FeedPanel } from './components/Pet/FeedPanel'
import { usePetStore } from './stores/petStore'
import { useSceneAnalyzer, getSceneDescription } from './hooks/useSceneAnalyzer'
import { useSmartInteraction } from './hooks/useSmartInteraction'
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts'
import { useTheme } from './hooks/useTheme'
import { useMousePassthrough } from './hooks/useMousePassthrough'
import { useToast } from './components/common/Toast'
import { usePetStats } from './hooks/usePetStats'
import { debounce } from './utils/helpers'
import { getPetModelUrl } from '@shared/data/petModels'
import './styles/index.css'

function App() {
  const { state, setPosition, setDragging, handleClick, setMood, setAction } = usePetStore()
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDressUp, setShowDressUp] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [showFeed, setShowFeed] = useState(false)
  const [modelScale, setModelScale] = useState(0.4)
  const [petModelId, setPetModelId] = useState<string>('character')
  const [petModelUrl, setPetModelUrl] = useState<string>(getPetModelUrl('character'))
  const [isSpeaking, setIsSpeaking] = useState(false)
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 })
  const windowDragRef = useRef<{
    dragging: boolean
    startScreenX: number
    startScreenY: number
    startWinX: number
    startWinY: number
  } | null>(null)

  const { sceneInfo } = useSceneAnalyzer(120000, true)
  const { theme } = useTheme()
  const toast = useToast()
  const { stats, foods, feed, pet, play, getMoodFromStats } = usePetStats()
  const passthrough = useMousePassthrough()

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide')
    if (!hasSeenGuide) {
      setShowGuide(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.events?.onOpenSettings) return
    const off = window.electronAPI.events.onOpenSettings(() => {
      setShowSettings(true)
    })
    return () => off()
  }, [])

  useEffect(() => {
    const open =
      showChat || showSettings || showDressUp || showGame || showAchievement || showStatus || showFeed
    passthrough.setPanelOpen(open)
  }, [showChat, showSettings, showDressUp, showGame, showAchievement, showStatus, showFeed, passthrough])

  useEffect(() => {
    const load = async () => {
      if (!window.electronAPI?.config?.get) return
      const config = await window.electronAPI.config.get()
      const id = (config.petModelId as string) || 'character'
      setPetModelId(id)
      setPetModelUrl(getPetModelUrl(id))
    }
    void load()
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ petModelId?: string }>).detail
      const id = detail?.petModelId || 'character'
      setPetModelId(id)
      setPetModelUrl(getPetModelUrl(id))
    }
    window.addEventListener('pet-model-changed', handler as EventListener)
    return () => window.removeEventListener('pet-model-changed', handler as EventListener)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ speaking?: boolean }>).detail
      setIsSpeaking(Boolean(detail?.speaking))
    }
    window.addEventListener('tts-speaking', handler as EventListener)
    return () => window.removeEventListener('tts-speaking', handler as EventListener)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const mood = getMoodFromStats()
    if (mood === 'hungry') {
      setMood('sad')
    } else if (mood === 'tired') {
      setMood('sleepy')
    } else if (mood === 'love') {
      setMood('love')
    } else if (mood === 'happy') {
      setMood('happy')
    }
  }, [stats, getMoodFromStats, setMood])

  const showMessage = useCallback((message: string) => {
    setInfoMessage(message)
    setShowInfo(true)
  }, [])

  const startWindowDrag = useCallback(async (screenX: number, screenY: number) => {
    if (typeof window === 'undefined' || !window.electronAPI?.window?.getPosition) return
    const pos = await window.electronAPI.window.getPosition()
    if (!pos) return

    windowDragRef.current = {
      dragging: true,
      startScreenX: screenX,
      startScreenY: screenY,
      startWinX: pos.x,
      startWinY: pos.y,
    }
  }, [])

  useSmartInteraction(sceneInfo, setMood, showMessage, true)

  useEffect(() => {
    const timer = setTimeout(() => setShowInfo(false), 5000)
    return () => clearTimeout(timer)
  }, [showInfo])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const s = windowDragRef.current
      if (!s?.dragging) return
      const dx = e.screenX - s.startScreenX
      const dy = e.screenY - s.startScreenY
      void window.electronAPI?.window?.setPosition(s.startWinX + dx, s.startWinY + dy)
    }

    const onUp = async () => {
      const s = windowDragRef.current
      if (!s?.dragging) return
      windowDragRef.current = { ...s, dragging: false }
      const pos = await window.electronAPI?.window?.getPosition?.()
      if (pos && window.electronAPI?.config?.set) {
        await window.electronAPI.config.set({ windowPosition: pos })
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const savePosition = useCallback(
    debounce((x: number, y: number) => {
      localStorage.setItem('petPosition', JSON.stringify({ x, y }))
    }, 500),
    []
  )

  useEffect(() => {
    const savedPosition = localStorage.getItem('petPosition')
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition)
        setPosition(x, y)
      } catch (e) {
        console.error('Failed to load saved position:', e)
      }
    }
  }, [setPosition])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      setDragging(true)
      dragRef.current = {
        isDragging: true,
        startX: e.clientX - state.position.x,
        startY: e.clientY - state.position.y,
      }
      setDragOffset({
        x: e.clientX - state.position.x,
        y: e.clientY - state.position.y,
      })
    },
    [state.position, setDragging]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!state.isDragging) return

      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const petWidth = 250
      const petHeight = 300

      let newX = e.clientX - dragOffset.x
      let newY = e.clientY - dragOffset.y

      newX = Math.max(0, Math.min(newX, screenWidth - petWidth))
      newY = Math.max(0, Math.min(newY, screenHeight - petHeight))

      setPosition(newX, newY)
      savePosition(newX, newY)
    },
    [state.isDragging, dragOffset, setPosition, savePosition]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    dragRef.current.isDragging = false
  }, [setDragging])

  const handlePetClick = useCallback(async () => {
    handleClick()
    setShowInfo(true)
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.achievement) {
        await window.electronAPI.achievement.incrementStat('clickCount')
      }
    } catch (error) {
      console.error('Failed to increment click count:', error)
    }
  }, [handleClick])

  const handleDoubleClick = useCallback(() => {
    pet()
    setAction('jump')
    showMessage('摸摸头~好开心！')
    setTimeout(() => {
      setAction('idle')
    }, 1000)
  }, [pet, setAction, showMessage])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setModelScale(prev => Math.max(0.1, Math.min(2.0, prev + delta)))
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setShowSettings(true)
  }, [])

  const handleGameWin = useCallback(async () => {
    setMood('happy')
    play()
    showMessage('主人好厉害！')
    toast.success('游戏胜利！')
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.achievement) {
        await window.electronAPI.achievement.incrementStat('gameWins')
      }
    } catch (error) {
      console.error('Failed to increment game wins:', error)
    }
  }, [setMood, play, showMessage, toast])

  const handleFeed = useCallback((foodId: string) => {
    const success = feed(foodId)
    if (success) {
      toast.success('喂食成功！')
      setAction('eat')
      setTimeout(() => setAction('idle'), 2000)
    }
    return success
  }, [feed, setAction, toast])

  const closeAllPanels = useCallback(() => {
    setShowChat(false)
    setShowSettings(false)
    setShowDressUp(false)
    setShowGame(false)
    setShowAchievement(false)
    setShowStatus(false)
    setShowFeed(false)
  }, [])

  useKeyboardShortcuts({
    [SHORTCUTS.CLOSE_PANEL]: closeAllPanels,
    [SHORTCUTS.TOGGLE_CHAT]: () => setShowChat((prev) => !prev),
    [SHORTCUTS.TOGGLE_SETTINGS]: () => setShowSettings((prev) => !prev),
    [SHORTCUTS.TOGGLE_DRESSUP]: () => setShowDressUp((prev) => !prev),
    [SHORTCUTS.TOGGLE_GAME]: () => setShowGame((prev) => !prev),
    [SHORTCUTS.TOGGLE_ACHIEVEMENT]: () => setShowAchievement((prev) => !prev),
  })

  const handleGuideComplete = useCallback(() => {
    setShowGuide(false)
  }, [])

  const getBubbleMessage = () => {
    if (infoMessage) return infoMessage
    if (stats.hunger < 20) return '好饿啊...想吃东西...'
    if (stats.energy < 20) return '好困...想睡觉...'
    if (state.mood === 'love') return '好开心呀~最喜欢主人了！'
    if (state.mood === 'happy') return '嘿嘿~今天心情真好~'
    if (state.mood === 'excited') return '哇！好兴奋！'
    if (state.mood === 'shy') return '主人...人家害羞啦...'
    if (state.mood === 'sad') return '呜呜...主人不理我...'
    if (sceneInfo.scene !== 'idle' && sceneInfo.scene !== 'unknown') {
      return `主人正在${getSceneDescription(sceneInfo.scene)}呢~`
    }
    return '双击聊天 | 右键设置'
  }

  return (
    <>
      <div className="app-container">
        <VRMCanvas
          modelUrl={petModelUrl}
          scale={modelScale}
          position={[0, -0.3, 0]}
          cameraPosition={[0, 0.8, 2.5]}
          cameraFov={35}
          mood={state.mood}
          action={state.action}
          speaking={isSpeaking}
          onClick={handlePetClick}
          onContextMenu={(e) => {
            e.preventDefault()
            setShowSettings(true)
          }}
          onDoubleClick={() => {
            pet()
            setAction('jump')
            showMessage('摸摸头~好开心！')
            setTimeout(() => {
              setAction('idle')
            }, 1000)
          }}
          onHoverChange={(hovering) => passthrough.setInteractiveHover(hovering)}
          onModelPointerDown={(e) => startWindowDrag(e.screenX, e.screenY)}
          onWheel={handleWheel}
        />
        {showInfo && <div className="pet-bubble">{getBubbleMessage()}</div>}
        {stats.hunger < 30 && !showInfo && (
          <div className="pet-bubble hunger-warning">饿了饿了...</div>
        )}
        <div className="pet-actions">
          <button
            className="action-btn feed-btn"
            onClick={() => setShowFeed(true)}
            title="喂食"
          >
            🍖
          </button>
          <button
            className="action-btn status-btn"
            onClick={() => setShowStatus(true)}
            title="状态"
          >
            💗
          </button>
          <button
            className="action-btn dressup-btn"
            onClick={() => setShowDressUp(true)}
            title="换装 (Ctrl+D)"
          >
            👗
          </button>
          <button
            className="action-btn game-btn"
            onClick={() => setShowGame(true)}
            title="游戏 (Ctrl+G)"
          >
            🎮
          </button>
          <button
            className="action-btn achievement-btn"
            onClick={() => setShowAchievement(true)}
            title="成就 (Ctrl+A)"
          >
            🏆
          </button>
        </div>
      </div>
      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showDressUp && <DressUpPanel onClose={() => setShowDressUp(false)} />}
      {showGame && (
        <GameSelector
          onClose={() => setShowGame(false)}
          onGameWin={handleGameWin}
        />
      )}
      {showAchievement && <AchievementPanel onClose={() => setShowAchievement(false)} />}
      {showStatus && <PetStatusPanel stats={stats} onClose={() => setShowStatus(false)} />}
      {showFeed && <FeedPanel foods={foods} onFeed={handleFeed} onClose={() => setShowFeed(false)} />}
      {showGuide && <OnboardingGuide onComplete={handleGuideComplete} />}
    </>
  )
}

export default App
