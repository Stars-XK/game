export const PET_MODELS = [
  { id: 'character', name: '默认', url: '/models/character.vrm' },
  { id: 'xiaomeng', name: '小萌', url: '/models/小萌.vrm' },
] as const

export type PetModelId = typeof PET_MODELS[number]['id']

export function getPetModelUrl(id: string | undefined | null): string {
  const found = PET_MODELS.find((m) => m.id === id)
  return found?.url || PET_MODELS[0].url
}

