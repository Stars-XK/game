import { useState, useEffect, useCallback, useRef } from 'react'

interface UseBlinkOptions {
  enabled?: boolean
  minInterval?: number
  maxInterval?: number
  blinkDuration?: number
}

export function useBlink(options: UseBlinkOptions = {}) {
  const {
    enabled = true,
    minInterval = 2000,
    maxInterval = 6000,
    blinkDuration = 150,
  } = options

  const [isBlinking, setIsBlinking] = useState(false)
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const blink = useCallback(() => {
    if (!enabled || isBlinking) return

    setIsBlinking(true)

    closeTimeoutRef.current = setTimeout(() => {
      setIsBlinking(false)
    }, blinkDuration)
  }, [enabled, isBlinking, blinkDuration])

  const scheduleNextBlink = useCallback(() => {
    if (!enabled) return

    const interval = Math.random() * (maxInterval - minInterval) + minInterval

    blinkTimeoutRef.current = setTimeout(() => {
      blink()
      scheduleNextBlink()
    }, interval)
  }, [enabled, minInterval, maxInterval, blink])

  useEffect(() => {
    if (!enabled) return

    scheduleNextBlink()

    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [enabled, scheduleNextBlink])

  return {
    isBlinking,
    blink,
  }
}

interface UseSleepOptions {
  enabled?: boolean
  idleTimeThreshold?: number
}

export function useSleep(options: UseSleepOptions = {}) {
  const { enabled = true, idleTimeThreshold = 120000 } = options

  const [isSleeping, setIsSleeping] = useState(false)
  const lastActivityTime = useRef(Date.now())
  const checkIntervalRef = useRef<ReturnType<typeof setInterval>>()

  const recordActivity = useCallback(() => {
    lastActivityTime.current = Date.now()
    if (isSleeping) {
      setIsSleeping(false)
    }
  }, [isSleeping])

  useEffect(() => {
    if (!enabled) return

    const handleActivity = () => {
      recordActivity()
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('mousedown', handleActivity)
    window.addEventListener('keydown', handleActivity)

    checkIntervalRef.current = setInterval(() => {
      const now = Date.now()
      if (now - lastActivityTime.current > idleTimeThreshold && !isSleeping) {
        setIsSleeping(true)
      }
    }, 10000)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [enabled, idleTimeThreshold, isSleeping, recordActivity])

  return {
    isSleeping,
    recordActivity,
    wakeUp: () => setIsSleeping(false),
  }
}
