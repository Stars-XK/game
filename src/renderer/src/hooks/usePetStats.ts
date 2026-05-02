import { useState, useEffect, useCallback } from 'react'

export interface PetStats {
  hunger: number
  happiness: number
  affection: number
  energy: number
}

export interface FoodItem {
  id: string
  name: string
  emoji: string
  hungerRestore: number
  happinessBonus: number
}

const FOODS: FoodItem[] = [
  { id: 'apple', name: '苹果', emoji: '🍎', hungerRestore: 20, happinessBonus: 5 },
  { id: 'cake', name: '蛋糕', emoji: '🍰', hungerRestore: 40, happinessBonus: 15 },
  { id: 'pizza', name: '披萨', emoji: '🍕', hungerRestore: 50, happinessBonus: 10 },
  { id: 'icecream', name: '冰淇淋', emoji: '🍦', hungerRestore: 15, happinessBonus: 20 },
  { id: 'cookie', name: '饼干', emoji: '🍪', hungerRestore: 10, happinessBonus: 8 },
]

const STATS_KEY = 'petStats'
const HUNGER_DECAY_INTERVAL = 60000
const ENERGY_RECOVERY_INTERVAL = 120000

export function usePetStats() {
  const [stats, setStats] = useState<PetStats>(() => {
    const saved = localStorage.getItem(STATS_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { hunger: 100, happiness: 50, affection: 50, energy: 100 }
      }
    }
    return { hunger: 100, happiness: 50, affection: 50, energy: 100 }
  })

  const [lastFedTime, setLastFedTime] = useState(Date.now())

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }, [stats])

  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 1),
      }))
    }, HUNGER_DECAY_INTERVAL)

    const energyTimer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        energy: Math.min(100, prev.energy + 1),
      }))
    }, ENERGY_RECOVERY_INTERVAL)

    return () => {
      clearInterval(hungerTimer)
      clearInterval(energyTimer)
    }
  }, [])

  const feed = useCallback((foodId: string) => {
    const food = FOODS.find((f) => f.id === foodId)
    if (!food) return false

    setStats((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + food.hungerRestore),
      happiness: Math.min(100, prev.happiness + food.happinessBonus),
    }))
    setLastFedTime(Date.now())
    return true
  }, [])

  const pet = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      affection: Math.min(100, prev.affection + 5),
      happiness: Math.min(100, prev.happiness + 3),
    }))
  }, [])

  const play = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      energy: Math.max(0, prev.energy - 5),
    }))
  }, [])

  const getMoodFromStats = useCallback((): 'happy' | 'normal' | 'sad' | 'hungry' | 'tired' | 'love' => {
    if (stats.hunger < 20) return 'hungry'
    if (stats.energy < 20) return 'tired'
    if (stats.affection > 80) return 'love'
    if (stats.happiness > 70) return 'happy'
    if (stats.happiness < 30) return 'sad'
    return 'normal'
  }, [stats])

  return {
    stats,
    foods: FOODS,
    feed,
    pet,
    play,
    getMoodFromStats,
    lastFedTime,
  }
}
