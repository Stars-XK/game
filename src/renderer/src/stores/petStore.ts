import { useState, useCallback, useEffect } from 'react'
import { ClothesCategory } from '@shared/types/clothes'
import { PetAppearanceConfig } from '@shared/types/config'

export type PetMood = 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love' | 'shy' | 'excited'
export type PetAction = 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump' | 'wave' | 'dance' | 'blowKiss'

export interface PetAppearance {
  bodyColor: string
  bodyColorSecondary: string
  hairColor: string
  eyeColor: string
  clothes: Record<ClothesCategory, string | null>
}

export interface PetState {
  mood: PetMood
  action: PetAction
  position: { x: number; y: number }
  isDragging: boolean
  clickCount: number
  lastClickTime: number
  appearance: PetAppearance
}

const DEFAULT_APPEARANCE: PetAppearance = {
  bodyColor: '#ffe4c4',
  bodyColorSecondary: '#ffd4b4',
  hairColor: '#4a3728',
  eyeColor: '#6b5b95',
  clothes: {
    hair: null,
    top: null,
    bottom: null,
    dress: null,
    shoes: null,
    accessory: null,
  },
}

const initialState: PetState = {
  mood: 'normal',
  action: 'idle',
  position: { x: 100, y: 100 },
  isDragging: false,
  clickCount: 0,
  lastClickTime: 0,
  appearance: DEFAULT_APPEARANCE,
}

function convertConfigToAppearance(config: PetAppearanceConfig): PetAppearance {
  return {
    bodyColor: config.bodyColor,
    bodyColorSecondary: config.bodyColorSecondary,
    hairColor: config.hairColor || '#4a3728',
    eyeColor: config.eyeColor || '#6b5b95',
    clothes: {
      hair: config.clothes.hair,
      top: config.clothes.top,
      bottom: config.clothes.bottom,
      dress: config.clothes.dress,
      shoes: config.clothes.shoes,
      accessory: config.clothes.accessory,
    },
  }
}

function convertAppearanceToConfig(appearance: PetAppearance): PetAppearanceConfig {
  return {
    bodyColor: appearance.bodyColor,
    bodyColorSecondary: appearance.bodyColorSecondary,
    hairColor: appearance.hairColor,
    eyeColor: appearance.eyeColor,
    clothes: {
      hair: appearance.clothes.hair,
      top: appearance.clothes.top,
      bottom: appearance.clothes.bottom,
      dress: appearance.clothes.dress,
      shoes: appearance.clothes.shoes,
      accessory: appearance.clothes.accessory,
    },
  }
}

export function usePetStore() {
  const [state, setState] = useState<PetState>(initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadAppearance = async () => {
      try {
        if (typeof window !== 'undefined' && window.electronAPI?.config) {
          const config = await window.electronAPI.config.get()
          if (config?.appearance) {
            const appearance = convertConfigToAppearance(config.appearance as PetAppearanceConfig)
            setState((prev) => ({ ...prev, appearance }))
          }
        }
      } catch (error) {
        console.error('Failed to load appearance:', error)
      }
      setIsLoaded(true)
    }
    loadAppearance()
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const saveAppearance = async () => {
      try {
        if (typeof window !== 'undefined' && window.electronAPI?.config) {
          const appearanceConfig = convertAppearanceToConfig(state.appearance)
          await window.electronAPI.config.set({ appearance: appearanceConfig })
        }
      } catch (error) {
        console.error('Failed to save appearance:', error)
      }
    }

    const debounceTimer = setTimeout(saveAppearance, 500)
    return () => clearTimeout(debounceTimer)
  }, [state.appearance, isLoaded])

  const setMood = useCallback((mood: PetMood) => {
    setState((prev) => ({ ...prev, mood }))
  }, [])

  const setAction = useCallback((action: PetAction) => {
    setState((prev) => ({ ...prev, action }))
  }, [])

  const setPosition = useCallback((x: number, y: number) => {
    setState((prev) => ({ ...prev, position: { x, y } }))
  }, [])

  const setDragging = useCallback((isDragging: boolean) => {
    setState((prev) => ({ ...prev, isDragging }))
  }, [])

  const handleClick = useCallback(() => {
    const now = Date.now()
    setState((prev) => {
      const isDoubleClick = now - prev.lastClickTime < 500
      const newClickCount = isDoubleClick ? prev.clickCount + 1 : 1

      let newMood: PetMood = prev.mood
      if (newClickCount >= 5) {
        newMood = 'love'
      } else if (newClickCount >= 3) {
        newMood = 'happy'
      }

      return {
        ...prev,
        clickCount: newClickCount,
        lastClickTime: now,
        mood: newMood,
      }
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.clickCount >= 5) {
          return { ...prev, mood: 'normal', clickCount: 0 }
        }
        return prev
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  const resetClickCount = useCallback(() => {
    setState((prev) => ({ ...prev, clickCount: 0 }))
  }, [])

  const setClothes = useCallback((category: ClothesCategory, itemId: string | null) => {
    setState((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        clothes: {
          ...prev.appearance.clothes,
          [category]: itemId,
        },
      },
    }))
  }, [])

  const setBodyColor = useCallback((primary: string, secondary: string) => {
    setState((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        bodyColor: primary,
        bodyColorSecondary: secondary,
      },
    }))
  }, [])

  const resetAppearance = useCallback(() => {
    setState((prev) => ({
      ...prev,
      appearance: DEFAULT_APPEARANCE,
    }))
  }, [])

  return {
    state,
    setMood,
    setAction,
    setPosition,
    setDragging,
    handleClick,
    resetClickCount,
    setClothes,
    setBodyColor,
    resetAppearance,
    isLoaded,
  }
}
