import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM, VRMExpressionPresetName } from '@pixiv/three-vrm'

interface VRMModelProps {
  modelUrl: string
  scale?: number
  position?: [number, number, number]
  mood?: 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love' | 'shy' | 'excited'
  action?: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump' | 'wave' | 'dance' | 'blowKiss'
  speaking?: boolean
  onClick?: () => void
  onContextMenu?: (e: MouseEvent) => void
  onDoubleClick?: (e: MouseEvent) => void
  onHoverChange?: (hovering: boolean) => void
  onModelPointerDown?: (e: MouseEvent) => void
  onLoad?: (vrm: VRM) => void
  onFallback?: () => void
}

function VRMModel({ 
  modelUrl, 
  scale = 1, 
  position = [0, 0, 0],
  mood = 'normal', 
  action = 'idle', 
  speaking = false,
  onClick,
  onContextMenu,
  onDoubleClick,
  onHoverChange,
  onModelPointerDown,
  onLoad, 
  onFallback 
}: VRMModelProps) {
  const { scene, camera, gl } = useThree()
  const vrmRef = useRef<VRM | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const clockRef = useRef(new THREE.Clock())
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const hoveringRef = useRef(false)

  useEffect(() => {
    setLoaded(false)
    setError(null)
    setLoading(true)
    
    const loader = new GLTFLoader()
    
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser)
    })

    console.log('Loading VRM from:', modelUrl)

    loader.load(
      modelUrl,
      (gltf) => {
        console.log('GLTF loaded successfully')
        console.log('GLTF userData keys:', Object.keys(gltf.userData))
        
        const vrm = (gltf as any).userData.vrm as VRM | undefined
        
        if (!vrm) {
          console.error('VRM not found in gltf.userData.vrm')
          console.log('Available userData:', JSON.stringify(Object.keys(gltf.userData)))
          setError('VRM 数据未找到，请检查模型格式')
          setLoading(false)
          onFallback?.()
          return
        }
        
        console.log('VRM loaded successfully!')
        console.log('VRM humanoid:', vrm.humanoid ? 'Yes' : 'No')
        console.log('VRM expressionManager:', vrm.expressionManager ? 'Yes' : 'No')
        
        vrmRef.current = vrm
        vrm.scene.rotation.y = Math.PI
        vrm.scene.scale.setScalar(scale)
        vrm.scene.position.set(position[0], position[1], position[2])
        scene.add(vrm.scene)
        setLoaded(true)
        setLoading(false)
        onLoad?.(vrm)
      },
      (progress) => {
        const percent = Math.round((progress.loaded / (progress.total || 1)) * 100)
        console.log(`Loading VRM... ${percent}% (${progress.loaded}/${progress.total} bytes)`)
      },
      (err) => {
        console.error('Error loading VRM:', err)
        setError(`加载失败: ${err.message || '未知错误'}`)
        setLoading(false)
        onFallback?.()
      }
    )

    return () => {
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
        if (typeof vrmRef.current.dispose === 'function') {
          vrmRef.current.dispose()
        } else {
          console.warn('VRM object does not have dispose method')
        }
        vrmRef.current = null
        setLoaded(false)
      }
    }
  }, [modelUrl, scene, onLoad, onFallback, scale])

  useEffect(() => {
    if (!vrmRef.current || !loaded) return

    const vrm = vrmRef.current
    vrm.scene.scale.setScalar(scale)
    vrm.scene.position.set(position[0], position[1], position[2])
  }, [scale, position, loaded])

  useEffect(() => {
    if (!vrmRef.current || !loaded) return

    const vrm = vrmRef.current
    const expressionManager = vrm.expressionManager

    if (expressionManager) {
      expressionManager.setValue(VRMExpressionPresetName.Happy, 0)
      expressionManager.setValue(VRMExpressionPresetName.Sad, 0)
      expressionManager.setValue(VRMExpressionPresetName.Angry, 0)
      expressionManager.setValue(VRMExpressionPresetName.Relaxed, 0)
      expressionManager.setValue(VRMExpressionPresetName.Surprised, 0)

      switch (mood) {
        case 'happy':
        case 'love':
        case 'excited':
          expressionManager.setValue(VRMExpressionPresetName.Happy, 0.8)
          break
        case 'sad':
          expressionManager.setValue(VRMExpressionPresetName.Sad, 0.6)
          break
        case 'angry':
          expressionManager.setValue(VRMExpressionPresetName.Angry, 0.5)
          break
        case 'sleepy':
          expressionManager.setValue(VRMExpressionPresetName.Relaxed, 0.7)
          break
        case 'surprised':
          expressionManager.setValue(VRMExpressionPresetName.Surprised, 0.6)
          break
        case 'shy':
          expressionManager.setValue(VRMExpressionPresetName.Happy, 0.3)
          break
        default:
          break
      }
    }
  }, [mood, loaded])

  const checkIntersection = useCallback((event: MouseEvent) => {
    if (!vrmRef.current || !loaded) return false

    const rect = gl.domElement.getBoundingClientRect()
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(mouseRef.current, camera)
    
    const intersects = raycasterRef.current.intersectObject(vrmRef.current.scene, true)
    return intersects.length > 0
  }, [camera, gl, loaded])

  useEffect(() => {
    if (!loaded || !onHoverChange) return

    const handleMove = (event: MouseEvent) => {
      const hit = checkIntersection(event)
      if (hit !== hoveringRef.current) {
        hoveringRef.current = hit
        onHoverChange(hit)
      }
    }

    gl.domElement.addEventListener('mousemove', handleMove)
    return () => gl.domElement.removeEventListener('mousemove', handleMove)
  }, [checkIntersection, gl, loaded, onHoverChange])

  useEffect(() => {
    if (!loaded || !onClick) return

    const handleClick = (event: MouseEvent) => {
      if (checkIntersection(event)) {
        onClick()
      }
    }

    gl.domElement.addEventListener('click', handleClick)
    return () => gl.domElement.removeEventListener('click', handleClick)
  }, [gl, loaded, onClick, checkIntersection])

  useEffect(() => {
    if (!loaded || !onContextMenu) return

    const handleContextMenu = (event: MouseEvent) => {
      if (checkIntersection(event)) {
        event.preventDefault()
        onContextMenu(event)
      }
    }

    gl.domElement.addEventListener('contextmenu', handleContextMenu)
    return () => gl.domElement.removeEventListener('contextmenu', handleContextMenu)
  }, [gl, loaded, onContextMenu, checkIntersection])

  useEffect(() => {
    if (!loaded || !onDoubleClick) return

    const handleDoubleClick = (event: MouseEvent) => {
      if (checkIntersection(event)) {
        onDoubleClick(event)
      }
    }

    gl.domElement.addEventListener('dblclick', handleDoubleClick)
    return () => gl.domElement.removeEventListener('dblclick', handleDoubleClick)
  }, [gl, loaded, onDoubleClick, checkIntersection])

  useEffect(() => {
    if (!loaded || !onModelPointerDown) return

    const handleMouseDown = (event: MouseEvent) => {
      if (checkIntersection(event)) {
        onModelPointerDown(event)
      }
    }

    gl.domElement.addEventListener('mousedown', handleMouseDown)
    return () => gl.domElement.removeEventListener('mousedown', handleMouseDown)
  }, [checkIntersection, gl, loaded, onModelPointerDown])

  useFrame(() => {
    if (!vrmRef.current || !loaded) return

    const delta = clockRef.current.getDelta()
    vrmRef.current.update(delta)

    const time = clockRef.current.getElapsedTime()

    const expressionManager = vrmRef.current.expressionManager
    if (expressionManager) {
      const target = speaking ? 0.35 + 0.25 * Math.sin(time * 18) : 0
      const current = expressionManager.getValue(VRMExpressionPresetName.Aa) || 0
      const next = current + (target - current) * 0.35
      expressionManager.setValue(VRMExpressionPresetName.Aa, next)
    }

    if (action === 'wave' && vrmRef.current.humanoid) {
      const rightUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightUpperArm')
      if (rightUpperArm) {
        rightUpperArm.rotation.z = -1.5 + Math.sin(time * 8) * 0.3
      }
    }

    if (action === 'dance' && vrmRef.current.humanoid) {
      const spine = vrmRef.current.humanoid.getNormalizedBoneNode('spine')
      if (spine) {
        spine.rotation.y = Math.sin(time * 2) * 0.2
      }
    }

    if (action === 'jump') {
      const jumpPhase = time % 1
      vrmRef.current.scene.position.y = position[1] + Math.sin(jumpPhase * Math.PI) * 0.2
    }
  })



  if (loading) {
    return (
      <group>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#ff6b9d" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.4, 0.15]} />
          <meshStandardMaterial color="#ffb7c5" />
        </mesh>
      </group>
    )
  }

  if (error || !loaded) {
    return (
      <group>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ff6b9d" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
          <meshStandardMaterial color="#ffb7c5" />
        </mesh>
        <mesh position={[0.12, 0.32, 0.1]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.12, 0.32, 0.1]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    )
  }

  return (
    <RigidBody type="dynamic" mass={10} position={position}>
      <CuboidCollider args={[0.3, 0.8, 0.3]} />
      <primitive object={vrmRef.current?.scene} />
    </RigidBody>
  )
}

interface VRMCanvasProps {
  modelUrl?: string
  scale?: number
  position?: [number, number, number]
  cameraPosition?: [number, number, number]
  cameraFov?: number
  mood?: 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love' | 'shy' | 'excited'
  action?: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play' | 'jump' | 'wave' | 'dance' | 'blowKiss'
  speaking?: boolean
  onClick?: () => void
  onContextMenu?: (e: MouseEvent) => void
  onDoubleClick?: (e: MouseEvent) => void
  onHoverChange?: (hovering: boolean) => void
  onModelPointerDown?: (e: MouseEvent) => void
  onWheel?: (e: React.WheelEvent) => void
  onLoad?: (vrm: VRM) => void
}

export function VRMCanvas({
  modelUrl = '/models/character.vrm',
  scale = 1,
  position = [0, -0.5, 0],
  cameraPosition = [0, 1.0, 3],
  cameraFov = 30,
  mood = 'normal',
  action = 'idle',
  speaking = false,
  onClick,
  onContextMenu,
  onDoubleClick,
  onHoverChange,
  onModelPointerDown,
  onWheel,
  onLoad
}: VRMCanvasProps) {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw', 
      height: '100vh', 
      pointerEvents: 'none',
      zIndex: 0
    }}>
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        style={{ background: 'transparent', pointerEvents: 'auto' }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        onWheel={onWheel}
      >
        <Physics gravity={[0, -9.8, 0]}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 3]} intensity={1} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={0.5} />
          <pointLight position={[0, 2, 2]} intensity={0.3} />

          <VRMModel
            modelUrl={modelUrl}
            scale={scale}
            position={position}
            mood={mood}
            action={action}
            speaking={speaking}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
            onHoverChange={onHoverChange}
            onModelPointerDown={onModelPointerDown}
            onLoad={onLoad}
          />

          <RigidBody type="fixed" position={[0, -1, 0]}>
            <CuboidCollider args={[100, 0.1, 100]} />
          </RigidBody>
        </Physics>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  )
}

export function isVRMSupported(): boolean {
  return typeof WebGLRenderingContext !== 'undefined'
}

export type { VRM }
