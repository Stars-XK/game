export interface PetState {
  name: string
  mood: 'happy' | 'normal' | 'sad' | 'angry' | 'sleepy'
  action: 'idle' | 'walk' | 'sit' | 'sleep' | 'eat' | 'play'
  position: { x: number; y: number }
}

export interface PetAnimation {
  name: string
  frames: number
  duration: number
  loop: boolean
}

export interface PetExpression {
  type: 'happy' | 'normal' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'love'
  eyes: string
  mouth: string
}
