import { useState, useEffect, useCallback, useRef } from 'react'
import './Game.css'

interface WhackAMoleProps {
  onClose: () => void
  onWin: () => void
}

interface Mole {
  id: number
  isActive: boolean
  isHit: boolean
}

const GAME_DURATION = 30
const MOLE_INTERVAL = 800

export function WhackAMole({ onClose, onWin }: WhackAMoleProps) {
  const [moles, setMoles] = useState<Mole[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, isActive: false, isHit: false }))
  )
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('whackAMoleHighScore')
    return saved ? parseInt(saved, 10) : 0
  })

  const gameTimerRef = useRef<ReturnType<typeof setInterval>>()
  const moleTimerRef = useRef<ReturnType<typeof setInterval>>()

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setIsPlaying(true)
    setIsComplete(false)
    setMoles((prev) => prev.map((m) => ({ ...m, isActive: false, isHit: false })))
  }, [])

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setIsComplete(true)

    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('whackAMoleHighScore', score.toString())
    }

    if (score >= 10) {
      onWin()
    }
  }, [score, highScore, onWin])

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
      }
    }
  }, [isPlaying, timeLeft, endGame])

  useEffect(() => {
    if (isPlaying) {
      moleTimerRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 9)
        setMoles((prev) =>
          prev.map((m, i) =>
            i === randomIndex ? { ...m, isActive: true, isHit: false } : m
          )
        )

        setTimeout(() => {
          setMoles((prev) =>
            prev.map((m, i) =>
              i === randomIndex ? { ...m, isActive: false } : m
            )
          )
        }, MOLE_INTERVAL - 100)
      }, MOLE_INTERVAL)
    }

    return () => {
      if (moleTimerRef.current) {
        clearInterval(moleTimerRef.current)
      }
    }
  }, [isPlaying])

  const handleMoleClick = (moleId: number) => {
    if (!isPlaying) return

    const mole = moles.find((m) => m.id === moleId)
    if (!mole || !mole.isActive || mole.isHit) return

    setMoles((prev) =>
      prev.map((m) => (m.id === moleId ? { ...m, isHit: true } : m))
    )
    setScore((prev) => prev + 1)
  }

  return (
    <div className="game-panel whack-a-mole">
      <div className="game-header">
        <h2>🔨 打地鼠</h2>
        <button className="game-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">得分</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">时间</span>
          <span className="stat-value">{timeLeft}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">最高</span>
          <span className="stat-value">{highScore}</span>
        </div>
      </div>

      <div className="mole-grid">
        {moles.map((mole) => (
          <div
            key={mole.id}
            className={`mole-hole ${mole.isActive ? 'active' : ''} ${
              mole.isHit ? 'hit' : ''
            }`}
            onClick={() => handleMoleClick(mole.id)}
          >
            <div className="hole">
              <div className="mole">🐹</div>
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="game-complete">
          <div className="complete-content">
            <h3>🎉 游戏结束！</h3>
            <p>得分: {score}</p>
            {score >= highScore && score > 0 && <p className="new-record">🏆 新纪录！</p>}
            <button className="restart-btn" onClick={startGame}>
              再玩一次
            </button>
          </div>
        </div>
      )}

      {!isPlaying && !isComplete && (
        <button className="start-btn" onClick={startGame}>
          开始游戏
        </button>
      )}

      {isPlaying && (
        <div className="game-hint">点击地鼠得分！</div>
      )}
    </div>
  )
}
