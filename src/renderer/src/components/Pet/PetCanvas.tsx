import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { PetAppearance } from '../stores/petStore'

interface PetCanvasProps {
  mood: 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love' | 'shy' | 'excited'
  action: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump' | 'wave' | 'dance' | 'blowKiss'
  appearance?: PetAppearance
  onClick?: () => void
}

const CLOTHES_COLORS: Record<string, { primary: string; secondary: string }> = {
  'head-1': { primary: '#ff6b9d', secondary: '#ff8fab' },
  'head-2': { primary: '#4ecdc4', secondary: '#45b7aa' },
  'head-3': { primary: '#ffe66d', secondary: '#ffd93d' },
  'top-1': { primary: '#ff6b9d', secondary: '#ff8fab' },
  'top-2': { primary: '#667eea', secondary: '#764ba2' },
  'top-3': { primary: '#f093fb', secondary: '#f5576c' },
  'bottom-1': { primary: '#4ecdc4', secondary: '#45b7aa' },
  'bottom-2': { primary: '#667eea', secondary: '#764ba2' },
  'bottom-3': { primary: '#ffecd2', secondary: '#fcb69f' },
  'shoes-1': { primary: '#ff6b9d', secondary: '#ff8fab' },
  'shoes-2': { primary: '#667eea', secondary: '#764ba2' },
  'shoes-3': { primary: '#ffe66d', secondary: '#ffd93d' },
  'accessory-1': { primary: '#ffe66d', secondary: '#ffd93d' },
  'accessory-2': { primary: '#ff6b9d', secondary: '#ff8fab' },
  'accessory-3': { primary: '#4ecdc4', secondary: '#45b7aa' },
}

const TARGET_FPS = 30
const FRAME_INTERVAL = 1000 / TARGET_FPS

export function PetCanvas({ mood, action, appearance, onClick }: PetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const animationRef = useRef<number>(0)
  const frameRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  const bodyColor = appearance?.bodyColor || '#667eea'
  const bodyColorSecondary = appearance?.bodyColorSecondary || '#764ba2'
  const clothes = appearance?.clothes || {}

  const appearanceKey = useMemo(
    () => `${bodyColor}-${bodyColorSecondary}-${Object.entries(clothes).join('-')}`,
    [bodyColor, bodyColorSecondary, clothes]
  )

  useEffect(() => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas')
      offscreenRef.current.width = 200
      offscreenRef.current.height = 200
    }
  }, [])

  const getActionOffset = useCallback((frame: number, actionType: string) => {
    switch (actionType) {
      case 'walk':
        return {
          x: Math.sin(frame * 0.1) * 5,
          y: Math.abs(Math.sin(frame * 0.2)) * 3,
          rotation: Math.sin(frame * 0.1) * 0.05,
        }
      case 'sleep':
        return {
          x: 0,
          y: Math.sin(frame * 0.02) * 2 + 5,
          rotation: 0.1,
        }
      case 'eat':
        return {
          x: 0,
          y: Math.abs(Math.sin(frame * 0.15)) * 2,
          rotation: 0,
        }
      case 'play':
        return {
          x: Math.sin(frame * 0.15) * 8,
          y: Math.abs(Math.sin(frame * 0.3)) * 10,
          rotation: Math.sin(frame * 0.15) * 0.1,
        }
      case 'sit':
        return {
          x: 0,
          y: 5,
          rotation: 0,
        }
      case 'jump':
        return {
          x: 0,
          y: -Math.abs(Math.sin(frame * 0.2)) * 20,
          rotation: 0,
        }
      default:
        return {
          x: 0,
          y: Math.sin(frame * 0.05) * 3,
          rotation: 0,
        }
    }
  }, [])

  const drawPet = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      const centerX = 100
      const centerY = 100

      const actionOffset = getActionOffset(frame, action)
      const offsetX = actionOffset.x
      const offsetY = actionOffset.y
      const rotation = actionOffset.rotation

      ctx.clearRect(0, 0, 200, 200)

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.translate(-centerX, -centerY)

      const bodyGradient = ctx.createLinearGradient(40 + offsetX, 40 + offsetY, 160 + offsetX, 160 + offsetY)
      bodyGradient.addColorStop(0, bodyColor)
      bodyGradient.addColorStop(1, bodyColorSecondary)

      ctx.beginPath()
      ctx.ellipse(centerX + offsetX, centerY + offsetY, 50, 60, 0, 0, Math.PI * 2)
      ctx.fillStyle = bodyGradient
      ctx.shadowColor = 'rgba(102, 126, 234, 0.3)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 10
      ctx.fill()
      ctx.shadowColor = 'transparent'

      if (clothes.top) {
        const topColors = CLOTHES_COLORS[clothes.top]
        if (topColors) {
          const topGradient = ctx.createLinearGradient(50 + offsetX, 60 + offsetY, 150 + offsetX, 120 + offsetY)
          topGradient.addColorStop(0, topColors.primary)
          topGradient.addColorStop(1, topColors.secondary)
          ctx.beginPath()
          ctx.ellipse(centerX + offsetX, centerY - 15 + offsetY, 45, 35, 0, 0, Math.PI * 2)
          ctx.fillStyle = topGradient
          ctx.fill()
        }
      }

      if (clothes.bottom) {
        const bottomColors = CLOTHES_COLORS[clothes.bottom]
        if (bottomColors) {
          const bottomGradient = ctx.createLinearGradient(60 + offsetX, 110 + offsetY, 140 + offsetX, 160 + offsetY)
          bottomGradient.addColorStop(0, bottomColors.primary)
          bottomGradient.addColorStop(1, bottomColors.secondary)
          ctx.beginPath()
          ctx.ellipse(centerX + offsetX, centerY + 35 + offsetY, 35, 25, 0, 0, Math.PI)
          ctx.fillStyle = bottomGradient
          ctx.fill()
        }
      }

      if (clothes.shoes) {
        const shoesColors = CLOTHES_COLORS[clothes.shoes]
        if (shoesColors) {
          ctx.fillStyle = shoesColors.primary
          ctx.beginPath()
          ctx.ellipse(centerX - 20 + offsetX, centerY + 55 + offsetY, 12, 8, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(centerX + 20 + offsetX, centerY + 55 + offsetY, 12, 8, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const eyeY = centerY - 10 + offsetY
      const blinkPhase = Math.sin(frame * 0.1)
      let eyeHeight = blinkPhase > 0.95 ? 2 : 12

      if (action === 'sleep') {
        eyeHeight = 2
      }

      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(centerX - 18 + offsetX, eyeY, 8, eyeHeight, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(centerX + 18 + offsetX, eyeY, 8, eyeHeight, 0, 0, Math.PI * 2)
      ctx.fill()

      if (eyeHeight > 5) {
        let pupilOffsetY = 0
        if (mood === 'love') {
          pupilOffsetY = Math.sin(frame * 0.1) * 2
        }

        ctx.fillStyle = '#333'
        ctx.beginPath()
        ctx.arc(centerX - 16 + offsetX, eyeY + 2 + pupilOffsetY, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX + 20 + offsetX, eyeY + 2 + pupilOffsetY, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(centerX - 14 + offsetX, eyeY, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX + 22 + offsetX, eyeY, 2, 0, Math.PI * 2)
        ctx.fill()

        if (mood === 'love') {
          ctx.fillStyle = '#ff6b9d'
          ctx.beginPath()
          ctx.arc(centerX - 22 + offsetX, eyeY - 5, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(centerX + 24 + offsetX, eyeY - 5, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (clothes.head) {
        const headColors = CLOTHES_COLORS[clothes.head]
        if (headColors) {
          ctx.fillStyle = headColors.primary
          ctx.beginPath()
          ctx.moveTo(centerX - 30 + offsetX, centerY - 40 + offsetY)
          ctx.quadraticCurveTo(centerX + offsetX, centerY - 70 + offsetY, centerX + 30 + offsetX, centerY - 40 + offsetY)
          ctx.quadraticCurveTo(centerX + offsetX, centerY - 50 + offsetY, centerX - 30 + offsetX, centerY - 40 + offsetY)
          ctx.fill()
        }
      }

      if (clothes.accessory) {
        const accessoryColors = CLOTHES_COLORS[clothes.accessory]
        if (accessoryColors) {
          ctx.fillStyle = accessoryColors.primary
          ctx.beginPath()
          ctx.arc(centerX + 35 + offsetX, centerY - 25 + offsetY, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = accessoryColors.secondary
          ctx.beginPath()
          ctx.arc(centerX + 35 + offsetX, centerY - 25 + offsetY, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const mouthY = centerY + 15 + offsetY
      ctx.fillStyle = '#ff6b9d'

      switch (mood) {
        case 'happy':
        case 'love':
          ctx.beginPath()
          ctx.arc(centerX + offsetX, mouthY, 12, 0, Math.PI)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(centerX + offsetX, mouthY + 2, 8, 0, Math.PI)
          ctx.fill()
          break
        case 'sad':
          ctx.beginPath()
          ctx.arc(centerX + offsetX, mouthY + 8, 10, Math.PI, 0)
          ctx.fill()
          break
        case 'angry':
          ctx.fillRect(centerX - 10 + offsetX, mouthY, 20, 4)
          break
        case 'surprised':
          ctx.beginPath()
          ctx.arc(centerX + offsetX, mouthY, 10, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#333'
          ctx.beginPath()
          ctx.arc(centerX + offsetX, mouthY, 6, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'sleepy':
          ctx.beginPath()
          ctx.ellipse(centerX + offsetX, mouthY, 8, 5, 0, 0, Math.PI * 2)
          ctx.fill()
          break
        default:
          ctx.beginPath()
          ctx.arc(centerX + offsetX, mouthY, 8, 0, Math.PI)
          ctx.fill()
      }

      if (mood === 'angry') {
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(centerX - 28 + offsetX, eyeY - 18)
        ctx.lineTo(centerX - 10 + offsetX, eyeY - 12)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(centerX + 28 + offsetX, eyeY - 18)
        ctx.lineTo(centerX + 10 + offsetX, eyeY - 12)
        ctx.stroke()

        ctx.fillStyle = '#ff6b6b'
        ctx.beginPath()
        ctx.arc(centerX - 30 + offsetX, centerY + 5, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX + 30 + offsetX, centerY + 5, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      if (mood === 'love') {
        const heartY = centerY - 40 + offsetY
        const heartScale = 1 + Math.sin(frame * 0.1) * 0.1
        ctx.fillStyle = '#ff6b9d'
        ctx.save()
        ctx.translate(centerX + offsetX, heartY)
        ctx.scale(heartScale, heartScale)
        ctx.beginPath()
        ctx.moveTo(0, 8)
        ctx.bezierCurveTo(-12, -2, -12, -18, 0, -12)
        ctx.bezierCurveTo(12, -18, 12, -2, 0, 8)
        ctx.fill()
        ctx.restore()
      }

      if (mood === 'happy' || action === 'play') {
        const sparkleCount = 3
        for (let i = 0; i < sparkleCount; i++) {
          const angle = (frame * 0.05 + i * (Math.PI * 2 / sparkleCount)) % (Math.PI * 2)
          const radius = 70 + Math.sin(frame * 0.1 + i) * 10
          const sparkleX = centerX + Math.cos(angle) * radius + offsetX
          const sparkleY = centerY + Math.sin(angle) * radius * 0.5 + offsetY

          ctx.fillStyle = '#ffd700'
          ctx.font = '16px Arial'
          ctx.fillText('✨', sparkleX - 8, sparkleY + 8)
        }
      }

      if (action === 'sleep') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '14px Arial'
        const zOffset = (frame * 0.1) % 3
        ctx.fillText('z', centerX + 40 + zOffset * 5, centerY - 30 - zOffset * 10)
        ctx.fillText('Z', centerX + 50 + zOffset * 3, centerY - 45 - zOffset * 8)
        ctx.fillText('Z', centerX + 60 + zOffset, centerY - 60 - zOffset * 6)
      }

      if (action === 'eat') {
        ctx.fillStyle = '#ffe66d'
        ctx.beginPath()
        ctx.arc(centerX + 20 + offsetX, centerY + 5 + offsetY, 8, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    },
    [mood, action, bodyColor, bodyColorSecondary, clothes, getActionOffset]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let lastTime = 0

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime

      if (deltaTime >= FRAME_INTERVAL) {
        lastTime = currentTime - (deltaTime % FRAME_INTERVAL)
        frameRef.current++
        drawPet(ctx, frameRef.current)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [drawPet])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: isHovered ? 'pointer' : 'default',
        filter: isHovered ? 'brightness(1.1)' : 'none',
        transition: 'filter 0.2s ease',
        willChange: 'transform',
      }}
    />
  )
}
