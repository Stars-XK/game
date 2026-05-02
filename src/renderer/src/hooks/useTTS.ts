import { useState, useEffect, useCallback, useRef } from 'react'
import { TTSConfig, DEFAULT_TTS_CONFIG } from '@shared/types/tts'

interface UseTTSReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  voices: SpeechSynthesisVoice[]
  config: TTSConfig
  setConfig: (config: Partial<TTSConfig>) => void
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [config, setConfigState] = useState<TTSConfig>(DEFAULT_TTS_CONFIG)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const emitSpeaking = useCallback((speaking: boolean) => {
    window.dispatchEvent(new CustomEvent('tts-speaking', { detail: { speaking } }))
  }, [])

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)

      const chineseVoice = availableVoices.find(
        (v) => v.lang.includes('zh') || v.lang.includes('CN')
      )
      if (chineseVoice && !config.voice) {
        setConfigState((prev) => ({ ...prev, voice: chineseVoice.name }))
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [config.voice])

  const speak = useCallback(
    (text: string) => {
      if (!config.enabled || !text) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      const selectedVoice = voices.find((v) => v.name === config.voice)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.rate = config.rate
      utterance.pitch = config.pitch
      utterance.volume = config.volume

      utterance.onstart = () => {
        setIsSpeaking(true)
        emitSpeaking(true)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        emitSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        emitSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [config, voices, emitSpeaking]
  )

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    emitSpeaking(false)
  }, [emitSpeaking])

  const setConfig = useCallback((newConfig: Partial<TTSConfig>) => {
    setConfigState((prev) => ({ ...prev, ...newConfig }))
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    voices,
    config,
    setConfig,
  }
}
