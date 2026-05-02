import { useState } from 'react'
import { RockPaperScissors } from './RockPaperScissors'
import { PuzzleGame } from './PuzzleGame'
import { MemoryGame } from './MemoryGame'
import { WhackAMole } from './WhackAMole'

interface GameSelectorProps {
  onClose: () => void
  onGameWin?: () => void
}

type GameType = 'selector' | 'rps' | 'puzzle' | 'memory' | 'whack'

interface GameInfo {
  id: GameType
  name: string
  icon: string
  description: string
}

const GAMES: GameInfo[] = [
  {
    id: 'rps',
    name: '猜拳',
    icon: '✊',
    description: '经典石头剪刀布',
  },
  {
    id: 'puzzle',
    name: '拼图',
    icon: '🧩',
    description: '3x3数字拼图',
  },
  {
    id: 'memory',
    name: '记忆翻牌',
    icon: '🧠',
    description: '找出所有配对卡片',
  },
  {
    id: 'whack',
    name: '打地鼠',
    icon: '🔨',
    description: '限时打地鼠挑战',
  },
]

export function GameSelector({ onClose, onGameWin }: GameSelectorProps) {
  const [currentGame, setCurrentGame] = useState<GameType>('selector')

  const handleSelectGame = (gameId: GameType) => {
    setCurrentGame(gameId)
  }

  const handleBackToSelector = () => {
    setCurrentGame('selector')
  }

  if (currentGame === 'rps') {
    return (
      <RockPaperScissors
        onClose={handleBackToSelector}
        onWin={onGameWin}
      />
    )
  }

  if (currentGame === 'puzzle') {
    return (
      <PuzzleGame
        onClose={handleBackToSelector}
        onWin={onGameWin}
      />
    )
  }

  if (currentGame === 'memory') {
    return (
      <MemoryGame
        onClose={handleBackToSelector}
        onWin={onGameWin}
      />
    )
  }

  if (currentGame === 'whack') {
    return (
      <WhackAMole
        onClose={handleBackToSelector}
        onWin={onGameWin}
      />
    )
  }

  return (
    <div className="game-overlay" onClick={onClose}>
      <div className="game-selector-panel" onClick={(e) => e.stopPropagation()}>
        <div className="game-selector-header">
          <h2>选择游戏</h2>
          <button className="game-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="game-list">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="game-item"
              onClick={() => handleSelectGame(game.id)}
            >
              <div className="game-item-icon">{game.icon}</div>
              <div className="game-item-info">
                <div className="game-item-name">{game.name}</div>
                <div className="game-item-desc">{game.description}</div>
              </div>
              <div className="game-item-arrow">→</div>
            </div>
          ))}
        </div>

        <div className="game-selector-footer">
          更多游戏敬请期待...
        </div>
      </div>
    </div>
  )
}
