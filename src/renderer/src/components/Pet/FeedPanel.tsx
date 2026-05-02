import { FoodItem } from '../hooks/usePetStats'
import './FeedPanel.css'

interface FeedPanelProps {
  foods: FoodItem[]
  onFeed: (foodId: string) => boolean
  onClose: () => void
}

export function FeedPanel({ foods, onFeed, onClose }: FeedPanelProps) {
  const handleFeed = (foodId: string) => {
    const success = onFeed(foodId)
    if (success) {
      setTimeout(onClose, 500)
    }
  }

  return (
    <div className="feed-overlay" onClick={onClose}>
      <div className="feed-panel" onClick={(e) => e.stopPropagation()}>
        <div className="feed-header">
          <h3>🍖 喂食</h3>
          <button className="feed-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="food-grid">
          {foods.map((food) => (
            <div
              key={food.id}
              className="food-item"
              onClick={() => handleFeed(food.id)}
            >
              <div className="food-emoji">{food.emoji}</div>
              <div className="food-name">{food.name}</div>
              <div className="food-stats">
                <span className="hunger-restore">+{food.hungerRestore} 饱食</span>
                <span className="happiness-bonus">+{food.happinessBonus} 快乐</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
