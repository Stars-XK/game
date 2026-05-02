import { useState, useEffect, useCallback } from 'react'

export type RenderMode = '2d' | '3d' | 'vrm'

const STORAGE_KEY = 'renderMode'

export function useRenderMode() {
  const [mode, setModeState] = useState<RenderMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as RenderMode
    if (saved === '2d' || saved === '3d' || saved === 'vrm') {
      return saved
    }
    return 'vrm'
  })

  const setMode = useCallback((newMode: RenderMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
  }, [])

  const toggleMode = useCallback(() => {
    const modes: RenderMode[] = ['2d', '3d', 'vrm']
    const currentIndex = modes.indexOf(mode)
    const nextIndex = (currentIndex + 1) % modes.length
    setMode(modes[nextIndex])
  }, [mode, setMode])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as RenderMode
    if (saved === '2d' || saved === '3d' || saved === 'vrm') {
      setModeState(saved)
    }
  }, [])

  return {
    mode,
    setMode,
    toggleMode,
    is3D: mode === '3d',
    is2D: mode === '2d',
    isVRM: mode === 'vrm',
  }
}
