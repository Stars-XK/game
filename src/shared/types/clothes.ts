export type ClothesCategory = 'hair' | 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory'

export interface ClothesItem {
  id: string
  name: string
  category: ClothesCategory
  thumbnail: string
  sprite: string
  zIndex: number
}

export interface ClothesSet {
  id: string
  name: string
  items: Record<ClothesCategory, string | null>
}
