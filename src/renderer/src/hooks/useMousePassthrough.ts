import { useCallback, useEffect, useRef, useState } from 'react'

export function useMousePassthrough() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [interactiveHover, setInteractiveHover] = useState(false)
  const lastApplied = useRef<boolean | null>(null)
  const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const desiredPassthrough = !(panelOpen || interactiveHover)

  const apply = useCallback((value: boolean) => {
    if (typeof window === 'undefined') return
    if (!window.electronAPI?.window?.setMousePassthrough) return
    if (lastApplied.current === value) return
    lastApplied.current = value
    void window.electronAPI.window.setMousePassthrough(value)
  }, [])

  useEffect(() => {
    if (applyTimer.current) clearTimeout(applyTimer.current)
    applyTimer.current = setTimeout(() => apply(desiredPassthrough), 30)
    return () => {
      if (applyTimer.current) clearTimeout(applyTimer.current)
    }
  }, [apply, desiredPassthrough])

  return {
    panelOpen,
    setPanelOpen,
    interactiveHover,
    setInteractiveHover,
    desiredPassthrough,
  }
}

