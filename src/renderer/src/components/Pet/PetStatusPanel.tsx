import { PetStats } from '../hooks/usePetStats'

interface PetStatusPanelProps {
  stats: PetStats
  onClose: () => void
}

export function PetStatusPanel({ stats, onClose }: PetStatusPanelProps) {
  const getStatColor = (value: number) => {
    if (value >= 70) return '#4ecdc4'
    if (value >= 40) return '#ffd700'
    return '#ff6b9d'
  }

  const getStatEmoji = (type: string, value: number) => {
    if (type === 'hunger') {
      if (value >= 70) return '😋'
      if (value >= 40) return '😐'
      return '饥饿'
    }
    if (type === 'happiness') {
      if (value >= 70) return '😊'
      if (value >= 40) return '🙂'
      return '😢'
    }
    if (type === 'affection') {
      if (value >= 70) return '😍'
      if (value >= 40) return '😊'
      return '💔'
    }
    if (type === 'energy') {
      if (value >= 70) return '⚡'
      if (value >= 40) return '🔋'
      return '😴'
    }
    return ''
  }

  return (
    <div className="pet-status-overlay" onClick={onClose}>
      <div className="pet-status-panel" onClick={(e) => e.stopPropagation()}>
        <div className="status-header">
          <h3>宠物状态</h3>
          <button className="status-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="status-content">
          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-emoji">{getStatEmoji('hunger', stats.hunger)}</span>
              <span className="stat-name">饱食度</span>
            </div>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: `${stats.hunger}%`,
                  background: getStatColor(stats.hunger),
                }}
              />
            </div>
            <span className="stat-value">{Math.round(stats.hunger)}%</span>
          </div>

          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-emoji">{getStatEmoji('happiness', stats.happiness)}</span>
              <span className="stat-name">快乐值</span>
            </div>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: `${stats.happiness}%`,
                  background: getStatColor(stats.happiness),
                }}
              />
            </div>
            <span className="stat-value">{Math.round(stats.happiness)}%</span>
          </div>

          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-emoji">{getStatEmoji('affection', stats.affection)}</span>
              <span className="stat-name">好感度</span>
            </div>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: `${stats.affection}%`,
                  background: getStatColor(stats.affection),
                }}
              />
            </div>
            <span className="stat-value">{Math.round(stats.affection)}%</span>
          </div>

          <div className="stat-row">
            <div className="stat-info">
              <span className="stat-emoji">{getStatEmoji('energy', stats.energy)}</span>
              <span className="stat-name">精力值</span>
            </div>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: `${stats.energy}%`,
                  background: getStatColor(stats.energy),
                }}
              />
            </div>
            <span className="stat-value">{Math.round(stats.energy)}%</span>
          </div>
        </div>

        <div className="status-tips">
          <p>💡 提示：点击喂食按钮可以喂食宠物</p>
          <p>💡 提示：双击宠物可以摸头增加好感度</p>
        </div>
      </div>
    </div>
  )
}
