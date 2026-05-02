import { useState, useEffect, useCallback } from 'react'
import './Game.css'

interface MemoryGameProps {
  onClose: () => void
  onWin: () => void
}

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJIS = ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁']

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function MemoryGame({ onClose, onWin }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const initGame = useCallback(() => {
    const selectedEmojis = EMOJIS.slice(0, 8)
    const cardPairs = [...selectedEmojis, ...selectedEmojis]
    const shuffledCards = shuffleArray(cardPairs).map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))

    setCards(shuffledCards)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setTime(0)
    setIsRunning(false)
    setIsComplete(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isComplete])

  useEffect(() => {
    if (matches === 8 && !isComplete) {
      setIsComplete(true)
      setIsRunning(false)
      onWin()
    }
  }, [matches, isComplete, onWin])

  const handleCardClick = (cardId: number) => {
    if (isLocked) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    if (!isRunning) {
      setIsRunning(true)
    }

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)
      setIsLocked(true)

      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards.find((c) => c.id === firstId)
      const secondCard = newCards.find((c) => c.id === secondId)

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          )
        )
        setMatches((prev) => prev + 1)
        setFlippedCards([])
        setIsLocked(false)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          )
          setFlippedCards([])
          setIsLocked(false)
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="game-panel memory-game">
      <div className="game-header">
        <h2>🧠 记忆翻牌</h2>
        <button className="game-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">步数</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">配对</span>
          <span className="stat-value">{matches}/8</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">时间</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${
              card.isMatched ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="game-complete">
          <div className="complete-content">
            <h3>🎉 恭喜完成！</h3>
            <p>步数: {moves}</p>
            <p>时间: {formatTime(time)}</p>
            <button className="restart-btn" onClick={initGame}>
              再玩一次
            </button>
          </div>
        </div>
      )}

      <button className="restart-btn" onClick={initGame}>
        重新开始
      </button>
    </div>
  )
}
