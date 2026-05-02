import { useState, useMemo, useCallback } from 'react'
import { ClothesItem, ClothesCategory, Rarity, CLOTHES_DATA, CATEGORY_NAMES, RARITY_NAMES } from '@shared/data/clothes'
import { usePetStore } from '../../stores/petStore'
import { useToast } from '../common/Toast'
import { ParticleSystem } from '../common/ParticleSystem'
import './DressUpPanel.css'

const RarityIcons: Record<Rarity, string> = {
  common: '⭐',
  rare: '⭐⭐',
  epic: '⭐⭐⭐',
  legendary: '👑',
}

interface DressUpPanelProps {
  onClose: () => void
}

export function DressUpPanel({ onClose }: DressUpPanelProps) {
  const { state, setClothes } = usePetStore()
  const toast = useToast()
  const [selectedCategory, setSelectedCategory] = useState<ClothesCategory>('top')
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewItem, setPreviewItem] = useState<ClothesItem | null>(null)
  const [showOwnedOnly, setShowOwnedOnly] = useState(false)

  const filteredItems = useMemo(() => {
    return CLOTHES_DATA.filter((item) => {
      const matchesCategory = item.category === selectedCategory
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesOwned = !showOwnedOnly || item.isOwned
      return matchesCategory && matchesRarity && matchesSearch && matchesOwned
    })
  }, [selectedCategory, selectedRarity, searchQuery, showOwnedOnly])

  const currentWearing = useMemo(() => {
    return state.appearance.clothes[selectedCategory]
  }, [state.appearance.clothes, selectedCategory])

  const currentWearingItem = useMemo(() => {
    if (!currentWearing) return null
    return CLOTHES_DATA.find(item => item.id === currentWearing)
  }, [currentWearing])

  const handleWear = useCallback((item: ClothesItem) => {
    if (!item.isOwned) {
      toast.warning('你还没有拥有这件服装哦~')
      return
    }
    setClothes(item.category, item.id)
    toast.success(`已穿上 ${item.name}！`)
  }, [setClothes, toast])

  const handleTakeOff = useCallback(() => {
    setClothes(selectedCategory, null)
    toast.info('已脱下服装')
  }, [setClothes, selectedCategory, toast])

  const handleBuy = useCallback((item: ClothesItem) => {
    toast.info(`购买功能开发中... ${item.name} 需要 ${item.price} ${item.currency === 'gold' ? '金币' : '钻石'}`)
  }, [toast])

  return (
    <div className="dressup-overlay" onClick={onClose}>
      <div className="dressup-panel" onClick={(e) => e.stopPropagation()}>
        <ParticleSystem type="sparkle" count={15} active={true} />
        <div className="dressup-header">
          <h2>👗 换装间</h2>
          <button className="dressup-close" onClick={onClose}>×</button>
        </div>

        <div className="dressup-content">
          <div className="dressup-sidebar">
            <div className="category-tabs">
              {(Object.keys(CATEGORY_NAMES) as ClothesCategory[]).map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className="category-tab-name">{CATEGORY_NAMES[cat]}</span>
                </button>
              ))}
            </div>

            <div className="filter-section">
              <input
                type="text"
                placeholder="搜索服装..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div className="filter-options">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showOwnedOnly}
                    onChange={(e) => setShowOwnedOnly(e.target.checked)}
                  />
                  <span>只显示已拥有</span>
                </label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value as Rarity | 'all')}
                  className="rarity-filter"
                >
                  <option value="all">全部稀有度</option>
                  {Object.entries(RARITY_NAMES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="current-outfit">
              <h3>当前穿着</h3>
              <div className="current-item">
                {currentWearingItem ? (
                  <>
                    <span className="item-name">{currentWearingItem.name}</span>
                    <button className="takeoff-btn" onClick={handleTakeOff}>
                      脱下
                    </button>
                  </>
                ) : (
                  <span className="no-item">未穿着</span>
                )}
              </div>
            </div>
          </div>

          <div className="clothes-grid-container">
            <div className="clothes-grid">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`clothes-item ${item.rarity} ${currentWearing === item.id ? 'wearing' : ''}`}
                  onClick={() => setPreviewItem(item)}
                >
                  <div
                    className="item-preview"
                    style={{ background: `linear-gradient(135deg, ${item.colors.primary} 0%, ${item.colors.secondary} 100%)` }}
                  >
                    {!item.isOwned && <span className="lock-icon">🔒</span>}
                    {item.isFavorite && <span className="favorite-icon">❤️</span>}
                  </div>
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <div className="item-meta">
                      <span className={`rarity ${item.rarity}`}>
                        {RarityIcons[item.rarity]}
                      </span>
                      <span className="price">
                        {item.price} {item.currency === 'gold' ? '💰' : '💎'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="no-results">
                <span>没有找到符合条件的服装</span>
              </div>
            )}
          </div>
        </div>

        {previewItem && (
          <div className="preview-overlay" onClick={() => setPreviewItem(null)}>
            <div className="preview-container" onClick={(e) => e.stopPropagation()}>
              <div className="preview-header">
                <h3>{previewItem.name}</h3>
                <button className="preview-close" onClick={() => setPreviewItem(null)}>×</button>
              </div>
              <div
                className="preview-image"
                style={{ background: `linear-gradient(135deg, ${previewItem.colors.primary} 0%, ${previewItem.colors.secondary} 100%)` }}
              />
              <div className="preview-info">
                <div className="preview-rarity">
                  <span className={`rarity-badge ${previewItem.rarity}`}>
                    {RarityIcons[previewItem.rarity]} {RARITY_NAMES[previewItem.rarity]}
                  </span>
                </div>
                <p className="preview-description">{previewItem.description}</p>
                <div className="preview-tags">
                  {previewItem.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="preview-actions">
                  {previewItem.isOwned ? (
                    <button
                      className="wear-btn"
                      onClick={() => {
                        handleWear(previewItem)
                        setPreviewItem(null)
                      }}
                    >
                      穿上
                    </button>
                  ) : (
                    <button
                      className="buy-btn"
                      onClick={() => handleBuy(previewItem)}
                    >
                      购买 ({previewItem.price} {previewItem.currency === 'gold' ? '💰' : '💎'})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
