import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
  type: 'star' | 'heart' | 'sparkle' | 'petal'
}

interface ParticleSystemProps {
  type?: 'star' | 'heart' | 'sparkle' | 'petal'
  count?: number
  color?: string
  active?: boolean
}

const PARTICLE_COLORS = {
  star: ['#ffd700', '#ffec8b', '#fff8dc'],
  heart: ['#ff6b9d', '#ff8fab', '#ffb7c5'],
  sparkle: ['#fff', '#e0ffff', '#b0e0e6'],
  petal: ['#ffb7c5', '#ffcdd2', '#f8bbd9'],
}

const PARTICLE_EMOJIS = {
  star: '✨',
  heart: '💕',
  sparkle: '⭐',
  petal: '🌸',
}

export function ParticleSystem({ 
  type = 'star', 
  count = 20, 
  color,
  active = true 
}: ParticleSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const idCounterRef = useRef(0)

  const createParticle = useCallback((): Particle => {
    const colors = color ? [color] : PARTICLE_COLORS[type]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    return {
      id: idCounterRef.current++,
      x: Math.random() * 100,
      y: type === 'petal' ? -10 : Math.random() * 100,
      vx: (Math.random() - 0.5) * 2,
      vy: type === 'petal' ? Math.random() * 2 + 1 : (Math.random() - 0.5) * 2,
      size: Math.random() * 10 + 5,
      color: randomColor,
      opacity: Math.random() * 0.5 + 0.5,
      life: 0,
      maxLife: Math.random() * 100 + 100,
      type,
    }
  }, [type, color])

  useEffect(() => {
    if (!active) {
      particlesRef.current = []
      return
    }

    particlesRef.current = Array.from({ length: count }, createParticle)

    const animate = () => {
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx * 0.1,
          y: p.y + p.vy * 0.1,
          life: p.life + 1,
          opacity: Math.max(0, p.opacity - 0.002),
        }))
        .filter(p => p.life < p.maxLife && p.y < 110)

      while (particlesRef.current.length < count) {
        particlesRef.current.push(createParticle())
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = particlesRef.current
          .map(p => `<span 
            class="particle particle-${p.type}"
            style="
              position: absolute;
              left: ${p.x}%;
              top: ${p.y}%;
              font-size: ${p.size}px;
              opacity: ${p.opacity};
              transform: rotate(${p.life * 2}deg);
              pointer-events: none;
              transition: opacity 0.1s;
            "
          >${PARTICLE_EMOJIS[p.type]}</span>`)
          .join('')
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, count, createParticle, type])

  if (!active) return null

  return (
    <div 
      ref={containerRef}
      className="particle-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  )
}

export function SparkleEffect({ x, y, active }: { x: number; y: number; active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Array<{ id: number; x: number; y: number; vx: number; vy: number; life: number }>>([])
  const idCounter = useRef(0)

  useEffect(() => {
    if (!active) {
      particlesRef.current = []
      return
    }

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      particlesRef.current.push({
        id: idCounter.current++,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 0,
      })
    }

    const animate = () => {
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
        }))
        .filter(p => p.life < 20)

      if (containerRef.current) {
        containerRef.current.innerHTML = particlesRef.current
          .map(p => `<span 
            class="sparkle"
            style="
              position: absolute;
              left: ${p.x}px;
              top: ${p.y}px;
              font-size: 12px;
              opacity: ${1 - p.life / 20};
              pointer-events: none;
            "
          >✨</span>`)
          .join('')
      }

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, x, y])

  if (!active) return null

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 1001,
      }}
    />
  )
}

export function HeartBurst({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (!active) return

    particlesRef.current = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 100,
    }))

    const timeout = setTimeout(() => {
      particlesRef.current = []
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [active])

  if (!active) return null

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1002,
      }}
    >
      {particlesRef.current.map(p => (
        <span
          key={p.id}
          className="heart-burst"
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: '20px',
            animation: `heartFloat 1s ease-out forwards`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          💖
        </span>
      ))}
    </div>
  )
}
