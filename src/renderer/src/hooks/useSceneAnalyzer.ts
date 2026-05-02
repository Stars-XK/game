import { useState, useEffect, useCallback } from 'react'

export type SceneType =
  | 'idle'
  | 'working'
  | 'gaming'
  | 'watching_video'
  | 'browsing'
  | 'coding'
  | 'meeting'
  | 'unknown'

export interface SceneInfo {
  scene: SceneType
  confidence: number
  keywords: string[]
  timestamp: number
}

export function useSceneAnalyzer(intervalMs: number = 30000, enabled: boolean = true) {
  const [sceneInfo, setSceneInfo] = useState<SceneInfo>({
    scene: 'idle',
    confidence: 0,
    keywords: [],
    timestamp: 0,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeScene = useCallback(async () => {
    if (!enabled) return

    setIsAnalyzing(true)
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.screen) {
        const result = await window.electronAPI.screen.analyzeScene()
        if (result) {
          setSceneInfo(result)
        }
      }
    } catch (error) {
      console.error('Scene analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    analyzeScene()
    const interval = setInterval(analyzeScene, intervalMs)
    return () => clearInterval(interval)
  }, [analyzeScene, intervalMs, enabled])

  return {
    sceneInfo,
    isAnalyzing,
    analyzeScene,
  }
}

export function getSceneDescription(scene: SceneType): string {
  const descriptions: Record<SceneType, string> = {
    idle: '空闲中',
    working: '工作中',
    gaming: '游戏中',
    watching_video: '看视频中',
    browsing: '浏览网页',
    coding: '编程中',
    meeting: '会议中',
    unknown: '未知',
  }
  return descriptions[scene]
}

export function getSceneInteractionPrompt(scene: SceneType): string {
  const prompts: Record<SceneType, string> = {
    idle: '主人，你好像没什么事情做呢，要不要和我聊聊天？',
    working: '主人工作辛苦了，记得休息一下哦~',
    gaming: '哇，主人在玩游戏呢！看起来很有趣的样子~',
    watching_video: '主人正在看视频呢，不打扰你了~',
    browsing: '主人在浏览网页呀，有什么有趣的事情吗？',
    coding: '主人在写代码呢，好厉害！遇到问题可以问我哦~',
    meeting: '主人在开会，我会安静地陪着你的~',
    unknown: '主人，你在做什么呢？',
  }
  return prompts[scene]
}
