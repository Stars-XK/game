import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CLOTHES_DATA } from '@shared/data/clothes'

interface PetModelProps {
  mood: 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love' | 'shy' | 'excited'
  action: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump' | 'wave' | 'dance' | 'blowKiss'
  bodyColor: string
  bodyColorSecondary: string
  hairColor?: string
  eyeColor?: string
  clothes?: {
    hair?: string | null
    top?: string | null
    bottom?: string | null
    dress?: string | null
    shoes?: string | null
    accessory?: string | null
  }
  onClick?: () => void
}

function getClothesColor(itemId: string | null | undefined, colorKey: 'primary' | 'secondary' = 'primary'): string | null {
  if (!itemId) return null
  const item = CLOTHES_DATA.find(i => i.id === itemId)
  return item?.colors[colorKey] || null
}

function PetModel({ 
  mood, 
  action, 
  bodyColor, 
  bodyColorSecondary,
  hairColor = '#4a3728',
  eyeColor = '#6b5b95',
  clothes,
  onClick 
}: PetModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const leftEarRef = useRef<THREE.Mesh>(null)
  const rightEarRef = useRef<THREE.Mesh>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const leftEyeRef = useRef<THREE.Mesh>(null)
  const rightEyeRef = useRef<THREE.Mesh>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Mesh>(null)
  const hairRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)

  const [blinkState, setBlinkState] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(0)

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setBlinkState(true)
        setTimeout(() => setBlinkState(false), 150)
      }
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    if (action === 'eat' || action === 'speak') {
      const mouthInterval = setInterval(() => {
        setMouthOpen(Math.random() * 0.5 + 0.5)
      }, 100)
      return () => clearInterval(mouthInterval)
    } else {
      setMouthOpen(0)
    }
  }, [action])

  const topColor = getClothesColor(clothes?.top, 'primary')
  const topColorSecondary = getClothesColor(clothes?.top, 'secondary')
  const bottomColor = getClothesColor(clothes?.bottom, 'primary')
  const dressColor = getClothesColor(clothes?.dress, 'primary')
  const dressColorSecondary = getClothesColor(clothes?.dress, 'secondary')
  const shoesColor = getClothesColor(clothes?.shoes, 'primary')
  const accessoryColor = getClothesColor(clothes?.accessory, 'primary')
  const hairStyleColor = getClothesColor(clothes?.hair, 'primary') || hairColor

  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.4, metalness: 0.05 }),
    secondary: new THREE.MeshStandardMaterial({ color: bodyColorSecondary, roughness: 0.4, metalness: 0.05 }),
    hair: new THREE.MeshStandardMaterial({ color: hairStyleColor, roughness: 0.6, metalness: 0 }),
    eye: new THREE.MeshStandardMaterial({ color: eyeColor, roughness: 0.1, metalness: 0.1 }),
    eyeWhite: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1 }),
    eyeHighlight: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.8 }),
    mouth: new THREE.MeshStandardMaterial({ color: '#ff6b9d', roughness: 0.5 }),
    blush: new THREE.MeshStandardMaterial({ color: '#ffb7c5', transparent: true, opacity: 0.6 }),
    nose: new THREE.MeshStandardMaterial({ color: '#ffaaaa', roughness: 0.5 }),
    skin: new THREE.MeshStandardMaterial({ color: '#ffe4c4', roughness: 0.5, metalness: 0 }),
    top: topColor ? new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.5, metalness: 0.1 }) : null,
    topSecondary: topColorSecondary ? new THREE.MeshStandardMaterial({ color: topColorSecondary, roughness: 0.5 }) : null,
    bottom: bottomColor ? new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.5 }) : null,
    dress: dressColor ? new THREE.MeshStandardMaterial({ color: dressColor, roughness: 0.4, metalness: 0.1 }) : null,
    dressSecondary: dressColorSecondary ? new THREE.MeshStandardMaterial({ color: dressColorSecondary, roughness: 0.4 }) : null,
    shoes: shoesColor ? new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.3 }) : null,
    accessory: accessoryColor ? new THREE.MeshStandardMaterial({ color: accessoryColor, emissive: accessoryColor, emissiveIntensity: 0.2 }) : null,
  }), [bodyColor, bodyColorSecondary, hairStyleColor, eyeColor, topColor, topColorSecondary, bottomColor, dressColor, dressColorSecondary, shoesColor, accessoryColor])

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.getElapsedTime()

    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(time * 3) * 0.3
      tailRef.current.rotation.x = Math.sin(time * 2) * 0.1
    }

    if (leftEarRef.current && rightEarRef.current) {
      leftEarRef.current.rotation.z = Math.sin(time * 2) * 0.05 + 0.2
      rightEarRef.current.rotation.z = -Math.sin(time * 2) * 0.05 - 0.2
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(time * 1.5) * 0.1
      rightArmRef.current.rotation.x = -Math.sin(time * 1.5) * 0.1
    }

    if (hairRef.current) {
      hairRef.current.rotation.y = Math.sin(time * 0.5) * 0.02
    }

    switch (action) {
      case 'idle':
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.03
        groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02
        break
      case 'walk':
        groupRef.current.position.y = Math.abs(Math.sin(time * 6)) * 0.08
        groupRef.current.rotation.z = Math.sin(time * 3) * 0.08
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(time * 6) * 0.3
          rightLegRef.current.rotation.x = -Math.sin(time * 6) * 0.3
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(time * 6) * 0.2
          rightArmRef.current.rotation.x = Math.sin(time * 6) * 0.2
        }
        break
      case 'jump':
        const jumpPhase = time % 1
        groupRef.current.position.y = Math.sin(jumpPhase * Math.PI) * 0.6
        groupRef.current.rotation.z = Math.sin(time * 8) * 0.1
        break
      case 'sleep':
        groupRef.current.rotation.z = 0.4
        groupRef.current.position.y = -0.15
        if (bodyRef.current) {
          bodyRef.current.scale.y = 0.9 + Math.sin(time * 2) * 0.02
        }
        break
      case 'eat':
        groupRef.current.scale.y = 1 + Math.sin(time * 8) * 0.03
        groupRef.current.position.y = Math.sin(time * 4) * 0.02
        break
      case 'play':
        groupRef.current.rotation.z = Math.sin(time * 4) * 0.15
        groupRef.current.position.y = Math.abs(Math.sin(time * 3)) * 0.12
        if (tailRef.current) {
          tailRef.current.rotation.z = Math.sin(time * 8) * 0.5
        }
        break
      case 'sit':
        groupRef.current.position.y = -0.2
        groupRef.current.scale.y = 0.9
        break
      case 'wave':
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -1.2 + Math.sin(time * 8) * 0.3
          rightArmRef.current.rotation.x = 0
        }
        groupRef.current.position.y = Math.sin(time * 2) * 0.03
        break
      case 'dance':
        groupRef.current.rotation.y = Math.sin(time * 2) * 0.3
        groupRef.current.position.y = Math.abs(Math.sin(time * 4)) * 0.1
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.z = Math.sin(time * 4) * 0.5
          rightArmRef.current.rotation.z = -Math.sin(time * 4) * 0.5
        }
        break
      case 'blowKiss':
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.8
          rightArmRef.current.rotation.x = -0.3
        }
        groupRef.current.position.y = Math.sin(time * 2) * 0.05
        break
      default:
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.03
    }

    if (mood === 'happy' || mood === 'love' || mood === 'excited') {
      groupRef.current.scale.x = 1 + Math.sin(time * 3) * 0.02
    }

    if (mood === 'shy') {
      groupRef.current.rotation.z = Math.sin(time * 2) * 0.05
    }
  })

  const getEyeScale = (): [number, number, number] => {
    if (blinkState) return [1, 0.1, 1]
    if (mood === 'happy' || mood === 'love') return [0.9, 0.7, 1]
    if (mood === 'sad') return [1, 0.5, 1]
    if (mood === 'angry') return [1.1, 0.6, 1]
    if (mood === 'sleepy') return [1, 0.15, 1]
    if (mood === 'surprised') return [1.2, 1.2, 1]
    if (mood === 'shy') return [0.9, 0.8, 1]
    if (mood === 'excited') return [1.1, 1.1, 1]
    return [1, 1, 1]
  }

  const getEyePosition = () => {
    if (mood === 'sad') return { y: -0.02 }
    if (mood === 'angry') return { y: 0.05 }
    if (mood === 'shy') return { y: 0.02 }
    return { y: 0.05 }
  }

  const getMouthShape = () => {
    if (mouthOpen > 0) return 'open'
    if (mood === 'happy' || mood === 'love' || mood === 'excited') return 'smile'
    if (mood === 'sad') return 'frown'
    if (mood === 'angry') return 'angry'
    if (mood === 'surprised') return 'o'
    if (mood === 'sleepy') return 'sleep'
    if (mood === 'shy') return 'smallSmile'
    return 'neutral'
  }

  const eyePos = getEyePosition()
  const hasDress = clothes?.dress && materials.dress
  const hasTop = clothes?.top && materials.top
  const hasBottom = clothes?.bottom && materials.bottom
  const hasShoes = clothes?.shoes && materials.shoes
  const hasAccessory = clothes?.accessory && materials.accessory

  return (
    <group ref={groupRef} onClick={onClick} position={[0, 0, 0]}>
      <mesh ref={bodyRef} material={materials.skin} castShadow>
        <capsuleGeometry args={[0.35, 0.5, 16, 32]} />
      </mesh>

      {hasTop && (
        <mesh position={[0, 0.1, 0]} material={materials.top} castShadow>
          <capsuleGeometry args={[0.38, 0.35, 16, 32]} />
        </mesh>
      )}

      {hasDress && (
        <group position={[0, -0.1, 0]}>
          <mesh material={materials.dress} castShadow>
            <coneGeometry args={[0.45, 0.6, 32]} />
          </mesh>
          {materials.dressSecondary && (
            <mesh position={[0, 0.1, 0.2]} material={materials.dressSecondary}>
              <sphereGeometry args={[0.1, 16, 16]} />
            </mesh>
          )}
        </group>
      )}

      {!hasDress && hasBottom && (
        <mesh position={[0, -0.25, 0]} material={materials.bottom} castShadow>
          <capsuleGeometry args={[0.3, 0.25, 16, 32]} />
        </mesh>
      )}

      <mesh position={[0, 0.55, 0]} material={materials.skin}>
        <sphereGeometry args={[0.3, 32, 32]} />
      </mesh>

      <group ref={hairRef} position={[0, 0.75, 0]}>
        <mesh material={materials.hair}>
          <sphereGeometry args={[0.35, 32, 32]} />
        </mesh>
        <mesh position={[0.15, 0.1, 0.1]} material={materials.hair}>
          <sphereGeometry args={[0.12, 16, 16]} />
        </mesh>
        <mesh position={[-0.15, 0.1, 0.1]} material={materials.hair}>
          <sphereGeometry args={[0.12, 16, 16]} />
        </mesh>
        <mesh position={[0, 0.2, -0.05]} material={materials.hair}>
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>
      </group>

      {hasAccessory && (
        <mesh position={[0, 0.85, 0.1]} material={materials.accessory}>
          <torusGeometry args={[0.08, 0.02, 8, 16]} />
        </mesh>
      )}

      <mesh ref={leftEarRef} position={[-0.25, 0.75, 0]} material={materials.skin} rotation={[0, 0, 0.3]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>
      <mesh ref={rightEarRef} position={[0.25, 0.75, 0]} material={materials.skin} rotation={[0, 0, -0.3]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>

      <group position={[0, eyePos.y + 0.55, 0.25]}>
        <mesh position={[-0.1, 0.03, 0]} material={materials.eyeWhite}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        <mesh ref={leftEyeRef} position={[-0.1, 0.03, 0.06]} material={materials.eye} scale={getEyeScale()}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </mesh>
        <mesh position={[-0.08, 0.05, 0.09]} material={materials.eyeHighlight}>
          <sphereGeometry args={[0.015, 8, 8]} />
        </mesh>

        <mesh position={[0.1, 0.03, 0]} material={materials.eyeWhite}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.1, 0.03, 0.06]} material={materials.eye} scale={getEyeScale()}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </mesh>
        <mesh position={[0.12, 0.05, 0.09]} material={materials.eyeHighlight}>
          <sphereGeometry args={[0.015, 8, 8]} />
        </mesh>

        {(mood === 'happy' || mood === 'love' || mood === 'shy') && (
          <>
            <mesh position={[-0.2, -0.02, 0.04]} material={materials.blush}>
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
            <mesh position={[0.2, -0.02, 0.04]} material={materials.blush}>
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
          </>
        )}

        <mesh position={[0, -0.02, 0.08]} material={materials.nose}>
          <sphereGeometry args={[0.025, 12, 12]} />
        </mesh>

        {getMouthShape() === 'smile' && (
          <mesh position={[0, -0.08, 0.06]} material={materials.mouth} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
          </mesh>
        )}
        {getMouthShape() === 'smallSmile' && (
          <mesh position={[0, -0.08, 0.06]} material={materials.mouth} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.04, 0.012, 8, 16, Math.PI]} />
          </mesh>
        )}
        {getMouthShape() === 'open' && (
          <mesh position={[0, -0.08, 0.06]} material={materials.mouth}>
            <circleGeometry args={[0.04 + mouthOpen * 0.02, 16]} />
          </mesh>
        )}
        {getMouthShape() === 'frown' && (
          <mesh position={[0, -0.1, 0.06]} material={materials.mouth} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
          </mesh>
        )}
        {getMouthShape() === 'o' && (
          <mesh position={[0, -0.08, 0.06]} material={materials.mouth}>
            <circleGeometry args={[0.05, 16]} />
          </mesh>
        )}
        {getMouthShape() === 'angry' && (
          <mesh position={[0, -0.08, 0.06]} material={materials.mouth}>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
          </mesh>
        )}
        {getMouthShape() === 'sleep' && (
          <group position={[0, -0.06, 0.06]}>
            <mesh position={[-0.03, 0, 0]} material={materials.mouth}>
              <torusGeometry args={[0.02, 0.008, 8, 8, Math.PI]} />
            </mesh>
            <mesh position={[0.03, 0, 0]} material={materials.mouth}>
              <torusGeometry args={[0.02, 0.008, 8, 8, Math.PI]} />
            </mesh>
          </group>
        )}
        {getMouthShape() === 'neutral' && (
          <mesh position={[0, -0.08, 0.06]} material={materials.mouth}>
            <boxGeometry args={[0.08, 0.015, 0.02]} />
          </mesh>
        )}
      </group>

      <mesh ref={leftArmRef} position={[-0.45, 0.1, 0]} material={materials.skin} castShadow>
        <capsuleGeometry args={[0.08, 0.25, 8, 16]} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.45, 0.1, 0]} material={materials.skin} castShadow>
        <capsuleGeometry args={[0.08, 0.25, 8, 16]} />
      </mesh>

      <mesh ref={tailRef} position={[0, -0.1, -0.35]} material={materials.hair} rotation={[0.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>

      <mesh ref={leftLegRef} position={[-0.15, -0.5, 0.05]} material={hasShoes ? materials.shoes : materials.skin} castShadow>
        <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.15, -0.5, 0.05]} material={hasShoes ? materials.shoes : materials.skin} castShadow>
        <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
      </mesh>

      {mood === 'love' && (
        <>
          <mesh position={[-0.25, 0.65, 0.2]} material={new THREE.MeshStandardMaterial({ color: '#ff6b9d', emissive: '#ff6b9d', emissiveIntensity: 0.3 })}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
          <mesh position={[0.25, 0.65, 0.2]} material={new THREE.MeshStandardMaterial({ color: '#ff6b9d', emissive: '#ff6b9d', emissiveIntensity: 0.3 })}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
        </>
      )}
    </group>
  )
}

interface Pet3DCanvasProps {
  mood?: 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love' | 'shy' | 'excited'
  action?: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump' | 'wave' | 'dance' | 'blowKiss'
  bodyColor?: string
  bodyColorSecondary?: string
  hairColor?: string
  eyeColor?: string
  clothes?: {
    hair?: string | null
    top?: string | null
    bottom?: string | null
    dress?: string | null
    shoes?: string | null
    accessory?: string | null
  }
  onClick?: () => void
}

export function Pet3DCanvas({
  mood = 'normal',
  action = 'idle',
  bodyColor = '#ffe4c4',
  bodyColorSecondary = '#ffd4b4',
  hairColor = '#4a3728',
  eyeColor = '#6b5b95',
  clothes,
  onClick
}: Pet3DCanvasProps) {
  return (
    <div style={{ width: 200, height: 200 }}>
      <Canvas
        camera={{ position: [0, 0.3, 2], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.3} />

        <PetModel
          mood={mood}
          action={action}
          bodyColor={bodyColor}
          bodyColorSecondary={bodyColorSecondary}
          hairColor={hairColor}
          eyeColor={eyeColor}
          clothes={clothes}
          onClick={onClick}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  )
}
