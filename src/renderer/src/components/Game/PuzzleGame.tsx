import { useState, useEffect, useCallback } from 'react'
import './Game.css'

type Tile = {
  id: number
  currentPos: number
}

interface PuzzleGameProps {
  onClose: () => void
  onWin?: () => void
}

const GRID_SIZE = 3
const TOTAL_TILES = GRID_SIZE * GRID_SIZE

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function isSolvable(tiles: number[]): boolean {
  let inversions = 0
  for (let i = 0; i < tiles.length - 1; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) {
        inversions++
      }
    }
  }
  return inversions % 2 === 0
}

function createSolvablePuzzle(): number[] {
  let tiles: number[]
  do {
    tiles = shuffleArray(Array.from({ length: TOTAL_TILES }, (_, i) => i))
  } while (!isSolvable(tiles))
  return tiles
}

const EMOJI_SETS = [
  ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🪻', '🌼', '🪷'],
  ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌'],
  ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯'],
  ['⭐', '🌙', '☀️', '🌈', '❄️', '🔥', '💧', '🌿', '🌸'],
]

export function PuzzleGame({ onClose, onWin }: PuzzleGameProps) {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [emojiSet, setEmojiSet] = useState<string[]>(EMOJI_SETS[0])
  const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(null)

  const initGame = useCallback(() => {
    const shuffled = createSolvablePuzzle()
    const newTiles = shuffled.map((id, index) => ({
      id,
      currentPos: index,
    }))
    setTiles(newTiles)
    setMoves(0)
    setIsComplete(false)
    setStartTime(Date.now())
    setElapsedTime(0)
    setEmojiSet(EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)])
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (isComplete || startTime === 0) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isComplete, startTime])

  const checkComplete = useCallback((newTiles: Tile[]) => {
    const sorted = [...newTiles].sort((a, b) => a.currentPos - b.currentPos)
    const complete = sorted.every((tile, index) => tile.id === index)
    if (complete) {
      setIsComplete(true)
      onWin?.()
      if (!bestScore || moves < bestScore.moves || elapsedTime < bestScore.time) {
        setBestScore({ moves, time: elapsedTime })
      }
    }
  }, [moves, elapsedTime, bestScore, onWin])

  const handleTileClick = useCallback((clickedTile: Tile) => {
    if (isComplete) return

    const emptyTile = tiles.find((t) => t.id === 0)
    if (!emptyTile) return

    const clickedPos = clickedTile.currentPos
    const emptyPos = emptyTile.currentPos

    const clickedRow = Math.floor(clickedPos / GRID_SIZE)
    const clickedCol = clickedPos % GRID_SIZE
    const emptyRow = Math.floor(emptyPos / GRID_SIZE)
    const emptyCol = emptyPos % GRID_SIZE

    const isAdjacent =
      (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
      (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow)

    if (!isAdjacent) return

    setTiles((prev) => {
      const newTiles = prev.map((t) => {
        if (t.id === clickedTile.id) {
          return { ...t, currentPos: emptyPos }
        }
        if (t.id === 0) {
          return { ...t, currentPos: clickedPos }
        }
        return t
      })
      checkComplete(newTiles)
      return newTiles
    })
    setMoves((prev) => prev + 1)
  }, [tiles, isComplete, checkComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTileDisplay = (id: number) => {
    if (id === 0) return ''
    return emojiSet[id - 1] || id.toString()
  }

  return (
    <div className="game-overlay" onClick={onClose}>
      <div className="puzzle-panel" onClick={(e) => e.stopPropagation()}>
        <div className="puzzle-header">
          <h2>拼图游戏</h2>
          <button className="game-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="puzzle-stats">
          <div className="puzzle-stat">
            <span className="stat-label">步数</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="puzzle-stat">
            <span className="stat-label">时间</span>
            <span className="stat-value">{formatTime(elapsedTime)}</span>
          </div>
          {bestScore && (
            <div className="puzzle-stat best">
              <span className="stat-label">最佳</span>
              <span className="stat-value">{bestScore.moves}步</span>
            </div>
          )}
        </div>

        <div className="puzzle-grid">
          {tiles
            .sort((a, b) => a.currentPos - b.currentPos)
            .map((tile) => (
              <div
                key={tile.id}
                className={`puzzle-tile ${tile.id === 0 ? 'empty' : ''}`}
                onClick={() => tile.id !== 0 && handleTileClick(tile)}
              >
                {getTileDisplay(tile.id)}
              </div>
            ))}
        </div>

        {isComplete && (
          <div className="puzzle-complete">
            <div className="complete-icon">🎉</div>
            <div className="complete-text">恭喜完成！</div>
            <div className="complete-stats">
              用时 {formatTime(elapsedTime)}，共 {moves} 步
            </div>
          </div>
        )}

        <div className="puzzle-actions">
          <button className="btn-reset" onClick={initGame}>
            重新开始
          </button>
        </div>
      </div>
    </div>
  )
}
