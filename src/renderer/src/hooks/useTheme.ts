import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface UseThemeReturn {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored
    }
  } catch (e) {
    console.error('Failed to get stored theme:', e)
  }
  return 'auto'
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const applyTheme = useCallback((resolved: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', resolved)
    setResolvedTheme(resolved)
  }, [])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem('theme', newTheme)

      const resolved = newTheme === 'auto' ? getSystemTheme() : newTheme
      applyTheme(resolved)
    },
    [applyTheme]
  )

  const toggleTheme = useCallback(() => {
    setTheme((prev: Theme) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'auto'
      return 'light'
    })
  }, [setTheme])

  useEffect(() => {
    const stored = getStoredTheme()
    const resolved = stored === 'auto' ? getSystemTheme() : stored
    applyTheme(resolved)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme])

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }
}
