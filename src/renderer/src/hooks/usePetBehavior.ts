import { useState, useEffect, useCallback } from 'react'
import { PetAction, PetMood } from '../stores/petStore'

interface UsePetBehaviorOptions {
  enabled?: boolean
  idleActionInterval?: number
  moodChangeInterval?: number
}

interface PetBehaviorState {
  currentAction: PetAction
  currentMood: PetMood
  lastInteractionTime: number
  interactionCount: number
}

const IDLE_ACTIONS: PetAction[] = ['idle', 'sit', 'walk']
const HAPPY_ACTIONS: PetAction[] = ['play', 'jump']
const SLEEPY_ACTIONS: PetAction[] = ['sleep', 'sit']

export function usePetBehavior(options: UsePetBehaviorOptions = {}) {
  const { enabled = true, idleActionInterval = 30000, moodChangeInterval = 60000 } = options

  const [behavior, setBehavior] = useState<PetBehaviorState>({
    currentAction: 'idle',
    currentMood: 'normal',
    lastInteractionTime: Date.now(),
    interactionCount: 0,
  })

  const triggerRandomAction = useCallback(() => {
    if (!enabled) return

    const timeSinceLastInteraction = Date.now() - behavior.lastInteractionTime

    let actions: PetAction[]
    if (timeSinceLastInteraction > 300000) {
      actions = SLEEPY_ACTIONS
    } else if (behavior.interactionCount > 5) {
      actions = HAPPY_ACTIONS
    } else {
      actions = IDLE_ACTIONS
    }

    const randomAction = actions[Math.floor(Math.random() * actions.length)]
    setBehavior((prev) => ({ ...prev, currentAction: randomAction }))

    if (randomAction !== 'idle') {
      setTimeout(() => {
        setBehavior((prev) => ({ ...prev, currentAction: 'idle' }))
      }, 5000)
    }
  }, [enabled, behavior.lastInteractionTime, behavior.interactionCount])

  const recordInteraction = useCallback(() => {
    setBehavior((prev) => ({
      ...prev,
      lastInteractionTime: Date.now(),
      interactionCount: prev.interactionCount + 1,
      currentAction: 'idle',
    }))
  }, [])

  const setMood = useCallback((mood: PetMood) => {
    setBehavior((prev) => ({ ...prev, currentMood: mood }))
  }, [])

  const setAction = useCallback((action: PetAction) => {
    setBehavior((prev) => ({ ...prev, currentAction: action }))
  }, [])

  useEffect(() => {
    if (!enabled) return

    const actionTimer = setInterval(triggerRandomAction, idleActionInterval)
    return () => clearInterval(actionTimer)
  }, [enabled, idleActionInterval, triggerRandomAction])

  useEffect(() => {
    if (!enabled) return

    const moodTimer = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - behavior.lastInteractionTime

      if (timeSinceLastInteraction > 600000) {
        setBehavior((prev) => ({ ...prev, currentMood: 'sad' }))
      } else if (timeSinceLastInteraction > 300000) {
        setBehavior((prev) => ({ ...prev, currentMood: 'sleepy' }))
      } else if (behavior.interactionCount > 10) {
        setBehavior((prev) => ({ ...prev, currentMood: 'love' }))
      } else if (behavior.interactionCount > 5) {
        setBehavior((prev) => ({ ...prev, currentMood: 'happy' }))
      } else {
        setBehavior((prev) => ({ ...prev, currentMood: 'normal' }))
      }
    }, moodChangeInterval)

    return () => clearInterval(moodTimer)
  }, [enabled, moodChangeInterval, behavior.lastInteractionTime, behavior.interactionCount])

  useEffect(() => {
    const resetTimer = setInterval(() => {
      setBehavior((prev) => ({
        ...prev,
        interactionCount: Math.max(0, prev.interactionCount - 1),
      }))
    }, 120000)

    return () => clearInterval(resetTimer)
  }, [])

  return {
    action: behavior.currentAction,
    mood: behavior.currentMood,
    recordInteraction,
    setMood,
    setAction,
    interactionCount: behavior.interactionCount,
  }
}
