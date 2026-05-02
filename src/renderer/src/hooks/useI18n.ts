import { useState, useCallback, useEffect } from 'react'
import { Language, getTranslations, Translations } from '../i18n'

interface UseI18nReturn {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translations: Translations
}

const STORAGE_KEY = 'language'

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh-CN' || stored === 'en-US' || stored === 'ja-JP') {
      return stored
    }
  } catch (e) {
    console.error('Failed to get stored language:', e)
  }
  return 'zh-CN'
}

export function useI18n(): UseI18nReturn {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)
  const [translations, setTranslations] = useState<Translations>(() =>
    getTranslations(language)
  )

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    setTranslations(getTranslations(lang))
  }, [])

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.')
      let result: Translations | string = translations

      for (const k of keys) {
        if (typeof result === 'object' && result !== null) {
          result = result[k]
        } else {
          return key
        }
      }

      return typeof result === 'string' ? result : key
    },
    [translations]
  )

  useEffect(() => {
    setTranslations(getTranslations(language))
  }, [language])

  return {
    language,
    setLanguage,
    t,
    translations,
  }
}
