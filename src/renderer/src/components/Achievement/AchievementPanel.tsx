import { useState, useEffect } from 'react'
import { Achievement, AchievementProgress, ACHIEVEMENTS, AchievementCategory } from '@shared/types/achievement'
import './AchievementPanel.css'

interface AchievementPanelProps {
  onClose: () => void
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  interaction: '互动',
  game: '游戏',
  dressup: '换装',
  chat: '聊天',
  special: '特殊',
}

export function AchievementPanel({ onClose }: AchievementPanelProps) {
  const [progress, setProgress] = useState<Record<string, AchievementProgress>>({})
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const data = await window.electronAPI.achievement.getProgress()
      setProgress(data || {})
    } catch (error) {
      console.error('Failed to load achievements:', error)
    }
  }

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return ACHIEVEMENTS
    }
    return ACHIEVEMENTS.filter((a) => a.category === selectedCategory)
  }

  const getProgressPercentage = (achievement: Achievement): number => {
    const p = progress[achievement.id]
    if (!p) return 0
    return Math.min((p.current / p.target) * 100, 100)
  }

  const getUnlockedCount = () => {
    return Object.values(progress).filter((p) => p.unlocked).length
  }

  const categories: (AchievementCategory | 'all')[] = [
    'all',
    'interaction',
    'game',
    'dressup',
    'chat',
    'special',
  ]

  return (
    <div className="achievement-overlay" onClick={onClose}>
      <div className="achievement-panel" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-header">
          <h2>成就</h2>
          <div className="achievement-count">
            {getUnlockedCount()} / {ACHIEVEMENTS.length}
          </div>
          <button className="achievement-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="achievement-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="achievement-list">
          {getFilteredAchievements().map((achievement) => {
            const p = progress[achievement.id]
            const isUnlocked = p?.unlocked || false
            const progressPercent = getProgressPercentage(achievement)

            return (
              <div
                key={achievement.id}
                className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  {!isUnlocked && (
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="progress-text">
                        {p?.current || 0} / {achievement.requirement}
                      </div>
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="achievement-unlocked-time">
                      已解锁
                    </div>
                  )}
                </div>
                {isUnlocked && (
                  <div className="achievement-badge">✓</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
