import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface GLTFModelProps {
  url: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  action: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump'
  onClick?: () => void
}

function GLTFModel({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], action, onClick }: GLTFModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(url)
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null)

  useEffect(() => {
    if (scene) {
      const clone = scene.clone(true)
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      setClonedScene(clone)
    }
  }, [scene])

  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.getElapsedTime()

    switch (action) {
      case 'idle':
        groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.05
        break
      case 'walk':
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(time * 4)) * 0.1
        groupRef.current.rotation.y = Math.sin(time * 2) * 0.2
        break
      case 'jump':
        const jumpPhase = time % 1
        groupRef.current.position.y = position[1] + Math.sin(jumpPhase * Math.PI) * 0.5
        break
      case 'sleep':
        groupRef.current.rotation.z = 0.3
        groupRef.current.position.y = position[1] - 0.2
        break
      case 'eat':
        groupRef.current.scale.setScalar(scale * (1 + Math.sin(time * 6) * 0.02))
        break
      case 'play':
        groupRef.current.rotation.z = Math.sin(time * 3) * 0.15
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(time * 2)) * 0.1
        break
      default:
        groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.05
    }
  })

  if (!clonedScene) return null

  return (
    <group ref={groupRef} onClick={onClick} scale={scale} position={position} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  )
}

interface PetGLTFCanvasProps {
  modelUrl: string
  scale?: number
  action?: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump'
  onClick?: () => void
}

export function PetGLTFCanvas({
  modelUrl,
  scale = 1,
  action = 'idle',
  onClick
}: PetGLTFCanvasProps) {
  return (
    <div style={{ width: 200, height: 200 }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        <Suspense fallback={null}>
          <GLTFModel
            url={modelUrl}
            scale={scale}
            action={action}
            onClick={onClick}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  )
}

export function preloadModel(url: string) {
  useGLTF.preload(url)
}
