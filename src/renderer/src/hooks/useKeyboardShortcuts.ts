import { useEffect, useCallback } from 'react'

type KeyHandler = () => void

interface KeyBindings {
  [key: string]: KeyHandler
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcuts(
  bindings: KeyBindings,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const key = []
      if (event.ctrlKey || event.metaKey) key.push('ctrl')
      if (event.altKey) key.push('alt')
      if (event.shiftKey) key.push('shift')
      key.push(event.key.toLowerCase())

      const combo = key.join('+')

      const handler = bindings[combo]
      if (handler) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler()
      }
    },
    [bindings, enabled, preventDefault]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

export const SHORTCUTS = {
  TOGGLE_CHAT: 'ctrl+enter',
  NEW_CHAT: 'ctrl+n',
  CLOSE_PANEL: 'escape',
  TOGGLE_SETTINGS: 'ctrl+,',
  TOGGLE_DRESSUP: 'ctrl+d',
  TOGGLE_GAME: 'ctrl+g',
  TOGGLE_ACHIEVEMENT: 'ctrl+a',
  EXPORT_DATA: 'ctrl+e',
  COPY_MESSAGE: 'ctrl+c',
  PASTE_MESSAGE: 'ctrl+v',
}
