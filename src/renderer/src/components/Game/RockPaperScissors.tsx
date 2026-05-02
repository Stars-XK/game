import { useState, useEffect, useCallback } from 'react'
import './Game.css'

type Choice = 'rock' | 'paper' | 'scissors'
type Result = 'win' | 'lose' | 'draw' | null

interface GameResult {
  playerChoice: Choice
  petChoice: Choice
  result: Result
}

const CHOICE_EMOJI: Record<Choice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
}

const CHOICE_NAMES: Record<Choice, string> = {
  rock: '石头',
  paper: '布',
  scissors: '剪刀',
}

const WIN_MESSAGES = ['太棒了！你赢了！', '厉害厉害~', '主人好强！']
const LOSE_MESSAGES = ['嘿嘿，我赢啦~', '再来一局？', '主人加油！']
const DRAW_MESSAGES = ['平局！再来~', '不分胜负呢', '心有灵犀~']

function getRandomChoice(): Choice {
  const choices: Choice[] = ['rock', 'paper', 'scissors']
  return choices[Math.floor(Math.random() * choices.length)]
}

function determineWinner(player: Choice, pet: Choice): Result {
  if (player === pet) return 'draw'

  if (
    (player === 'rock' && pet === 'scissors') ||
    (player === 'paper' && pet === 'rock') ||
    (player === 'scissors' && pet === 'paper')
  ) {
    return 'win'
  }

  return 'lose'
}

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}

interface RockPaperScissorsProps {
  onClose: () => void
  onWin?: () => void
  onLose?: () => void
}

export function RockPaperScissors({ onClose, onWin, onLose }: RockPaperScissorsProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [petChoice, setPetChoice] = useState<Choice | null>(null)
  const [result, setResult] = useState<Result>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 })
  const [showResult, setShowResult] = useState(false)

  const play = useCallback((choice: Choice) => {
    if (isPlaying) return

    setIsPlaying(true)
    setPlayerChoice(choice)
    setPetChoice(null)
    setResult(null)
    setShowResult(false)

    setTimeout(() => {
      const pet = getRandomChoice()
      const gameResult = determineWinner(choice, pet)

      setPetChoice(pet)
      setResult(gameResult)
      setShowResult(true)
      setIsPlaying(false)

      setScore((prev) => {
        if (gameResult === 'win') {
          onWin?.()
          return { ...prev, wins: prev.wins + 1 }
        } else if (gameResult === 'lose') {
          onLose?.()
          return { ...prev, losses: prev.losses + 1 }
        }
        return { ...prev, draws: prev.draws + 1 }
      })
    }, 1000)
  }, [isPlaying, onWin, onLose])

  const getResultMessage = () => {
    if (!result) return ''
    if (result === 'win') return getRandomMessage(WIN_MESSAGES)
    if (result === 'lose') return getRandomMessage(LOSE_MESSAGES)
    return getRandomMessage(DRAW_MESSAGES)
  }

  return (
    <div className="game-overlay" onClick={onClose}>
      <div className="game-panel" onClick={(e) => e.stopPropagation()}>
        <div className="game-header">
          <h2>猜拳游戏</h2>
          <button className="game-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="game-score">
          <div className="score-item win">
            <span className="score-label">胜</span>
            <span className="score-value">{score.wins}</span>
          </div>
          <div className="score-item draw">
            <span className="score-label">平</span>
            <span className="score-value">{score.draws}</span>
          </div>
          <div className="score-item lose">
            <span className="score-label">负</span>
            <span className="score-value">{score.losses}</span>
          </div>
        </div>

        <div className="game-arena">
          <div className="player-side">
            <div className="player-label">你</div>
            <div className={`choice-display ${isPlaying ? 'thinking' : ''}`}>
              {playerChoice ? CHOICE_EMOJI[playerChoice] : '?'}
            </div>
          </div>

          <div className="vs-text">VS</div>

          <div className="pet-side">
            <div className="player-label">小萌</div>
            <div className={`choice-display ${isPlaying ? 'shaking' : ''}`}>
              {petChoice ? CHOICE_EMOJI[petChoice] : '?'}
            </div>
          </div>
        </div>

        {showResult && (
          <div className={`game-result ${result}`}>
            <div className="result-choices">
              {playerChoice && (
                <span className="choice-name">{CHOICE_NAMES[playerChoice]}</span>
              )}
              <span className="result-text">
                {result === 'win' ? '胜' : result === 'lose' ? '负' : '平'}
              </span>
              {petChoice && (
                <span className="choice-name">{CHOICE_NAMES[petChoice]}</span>
              )}
            </div>
            <div className="result-message">{getResultMessage()}</div>
          </div>
        )}

        <div className="game-choices">
          <button
            className="choice-btn"
            onClick={() => play('rock')}
            disabled={isPlaying}
          >
            <span className="choice-emoji">{CHOICE_EMOJI.rock}</span>
            <span className="choice-name">{CHOICE_NAMES.rock}</span>
          </button>
          <button
            className="choice-btn"
            onClick={() => play('paper')}
            disabled={isPlaying}
          >
            <span className="choice-emoji">{CHOICE_EMOJI.paper}</span>
            <span className="choice-name">{CHOICE_NAMES.paper}</span>
          </button>
          <button
            className="choice-btn"
            onClick={() => play('scissors')}
            disabled={isPlaying}
          >
            <span className="choice-emoji">{CHOICE_EMOJI.scissors}</span>
            <span className="choice-name">{CHOICE_NAMES.scissors}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
