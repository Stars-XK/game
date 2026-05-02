import { useState, useEffect, useCallback, useRef } from 'react'
import { SceneType, SceneInfo, getSceneInteractionPrompt } from './useSceneAnalyzer'
import { PetMood } from '../stores/petStore'

export interface InteractionRule {
  scene: SceneType | '*'
  minInterval: number
  probability: number
  action: () => void
}

export interface InteractionState {
  lastInteractionTime: number
  currentScene: SceneType
  interactionCount: number
}

export function useSmartInteraction(
  sceneInfo: SceneInfo,
  setMood: (mood: PetMood) => void,
  showMessage: (message: string) => void,
  enabled: boolean = true
) {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    lastInteractionTime: 0,
    currentScene: 'idle',
    interactionCount: 0,
  })
  const lastSceneRef = useRef<SceneType>('idle')

  const triggerInteraction = useCallback(
    (scene: SceneType) => {
      const now = Date.now()
      const timeSinceLastInteraction = now - interactionState.lastInteractionTime

      if (timeSinceLastInteraction < 60000) {
        return
      }

      const prompt = getSceneInteractionPrompt(scene)
      showMessage(prompt)

      switch (scene) {
        case 'working':
          setMood('normal')
          break
        case 'gaming':
          setMood('happy')
          break
        case 'watching_video':
          setMood('sleepy')
          break
        case 'coding':
          setMood('normal')
          break
        case 'meeting':
          setMood('normal')
          break
        default:
          setMood('normal')
      }

      setInteractionState((prev) => ({
        ...prev,
        lastInteractionTime: now,
        interactionCount: prev.interactionCount + 1,
      }))
    },
    [interactionState.lastInteractionTime, setMood, showMessage]
  )

  useEffect(() => {
    if (!enabled) return

    const currentScene = sceneInfo.scene
    const previousScene = lastSceneRef.current

    if (currentScene !== previousScene && currentScene !== 'unknown') {
      lastSceneRef.current = currentScene
      setInteractionState((prev) => ({
        ...prev,
        currentScene,
      }))

      if (sceneInfo.confidence > 0.5) {
        setTimeout(() => {
          triggerInteraction(currentScene)
        }, 2000)
      }
    }
  }, [sceneInfo, enabled, triggerInteraction])

  const forceInteraction = useCallback(() => {
    triggerInteraction(sceneInfo.scene)
  }, [sceneInfo.scene, triggerInteraction])

  return {
    interactionState,
    triggerInteraction: forceInteraction,
  }
}
