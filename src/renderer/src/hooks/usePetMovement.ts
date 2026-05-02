import { useState, useEffect, useCallback, useRef } from 'react'

interface Position {
  x: number
  y: number
}

interface UsePetMovementOptions {
  enabled?: boolean
  followMouse?: boolean
  randomMove?: boolean
  moveSpeed?: number
  randomMoveInterval?: number
}

export function usePetMovement(options: UsePetMovementOptions = {}) {
  const {
    enabled = true,
    followMouse = false,
    randomMove = true,
    moveSpeed = 2,
    randomMoveInterval = 30000,
  } = options

  const [targetPosition, setTargetPosition] = useState<Position | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const lastMoveTime = useRef(Date.now())
  const animationRef = useRef<number>()

  const startRandomMove = useCallback(() => {
    if (!enabled || !randomMove) return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const padding = 100

    const newX = Math.random() * (screenWidth - padding * 2) + padding
    const newY = Math.random() * (screenHeight - padding * 2) + padding

    setTargetPosition({ x: newX, y: newY })
    setIsMoving(true)
  }, [enabled, randomMove])

  const moveToPosition = useCallback((pos: Position) => {
    setTargetPosition(pos)
    setIsMoving(true)
  }, [])

  const followMousePosition = useCallback((mouseX: number, mouseY: number) => {
    if (!enabled || !followMouse) return

    const distance = 100
    const angle = Math.random() * Math.PI * 2
    const targetX = mouseX + Math.cos(angle) * distance
    const targetY = mouseY + Math.sin(angle) * distance

    setTargetPosition({ x: targetX, y: targetY })
    setIsMoving(true)
  }, [enabled, followMouse])

  useEffect(() => {
    if (!enabled || !randomMove) return

    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastMoveTime.current > randomMoveInterval) {
        startRandomMove()
        lastMoveTime.current = now
      }
    }, randomMoveInterval)

    return () => clearInterval(interval)
  }, [enabled, randomMove, randomMoveInterval, startRandomMove])

  useEffect(() => {
    if (!enabled || !followMouse) return

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMoveTime.current > 5000) {
        followMousePosition(e.clientX, e.clientY)
        lastMoveTime.current = now
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enabled, followMouse, followMousePosition])

  const updatePosition = useCallback(
    (currentPos: Position, onUpdate: (pos: Position) => void) => {
      if (!targetPosition || !isMoving) return false

      const dx = targetPosition.x - currentPos.x
      const dy = targetPosition.y - currentPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 5) {
        setIsMoving(false)
        setTargetPosition(null)
        return false
      }

      const ratio = Math.min(moveSpeed / distance, 1)
      const newX = currentPos.x + dx * ratio
      const newY = currentPos.y + dy * ratio

      setDirection(dx > 0 ? 'right' : 'left')
      onUpdate({ x: newX, y: newY })

      return true
    },
    [targetPosition, isMoving, moveSpeed]
  )

  const stopMoving = useCallback(() => {
    setIsMoving(false)
    setTargetPosition(null)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return {
    isMoving,
    direction,
    targetPosition,
    moveToPosition,
    startRandomMove,
    followMousePosition,
    updatePosition,
    stopMoving,
  }
}
