export type ClothesCategory = 'hair' | 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type Currency = 'gold' | 'diamond'

export interface ClothesItem {
  id: string
  name: string
  category: ClothesCategory
  rarity: Rarity
  price: number
  currency: Currency
  colors: {
    primary: string
    secondary: string
    accent?: string
  }
  description: string
  tags: string[]
  isOwned: boolean
  isFavorite: boolean
}

export interface ClothesCollection {
  items: ClothesItem[]
  gold: number
  diamonds: number
}

export const CLOTHES_DATA: ClothesItem[] = [
  // 发型
  {
    id: 'hair-1',
    name: '黑色长发',
    category: 'hair',
    rarity: 'common',
    price: 0,
    currency: 'gold',
    colors: { primary: '#1a1a1a', secondary: '#2d2d2d' },
    description: '柔顺的长发，自然垂落',
    tags: ['日常', '简约'],
    isOwned: true,
    isFavorite: false,
  },
  {
    id: 'hair-2',
    name: '粉色双马尾',
    category: 'hair',
    rarity: 'rare',
    price: 500,
    currency: 'gold',
    colors: { primary: '#ffb7c5', secondary: '#ffcdd2' },
    description: '可爱的粉色双马尾，充满少女感',
    tags: ['可爱', '甜美'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'hair-3',
    name: '银色短发',
    category: 'hair',
    rarity: 'epic',
    price: 50,
    currency: 'diamond',
    colors: { primary: '#c0c0c0', secondary: '#e8e8e8' },
    description: '酷酷的银色短发，个性十足',
    tags: ['酷帅', '个性'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'hair-4',
    name: '金色波浪卷',
    category: 'hair',
    rarity: 'legendary',
    price: 100,
    currency: 'diamond',
    colors: { primary: '#ffd700', secondary: '#ffec8b' },
    description: '华丽的金色波浪卷发，闪耀夺目',
    tags: ['华丽', '优雅'],
    isOwned: false,
    isFavorite: false,
  },

  // 上装
  {
    id: 'top-1',
    name: '白色T恤',
    category: 'top',
    rarity: 'common',
    price: 100,
    currency: 'gold',
    colors: { primary: '#ffffff', secondary: '#f5f5f5' },
    description: '简约的白色T恤',
    tags: ['日常', '简约'],
    isOwned: true,
    isFavorite: false,
  },
  {
    id: 'top-2',
    name: '粉色毛衣',
    category: 'top',
    rarity: 'rare',
    price: 400,
    currency: 'gold',
    colors: { primary: '#ffb7c5', secondary: '#ffcdd2' },
    description: '温暖的粉色毛衣，柔软舒适',
    tags: ['可爱', '温暖'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'top-3',
    name: '学院风衬衫',
    category: 'top',
    rarity: 'epic',
    price: 40,
    currency: 'diamond',
    colors: { primary: '#ffffff', secondary: '#4a90d9', accent: '#ff6b9d' },
    description: '学院风衬衫，搭配领结',
    tags: ['学院', '清新'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'top-4',
    name: '星空外套',
    category: 'top',
    rarity: 'legendary',
    price: 80,
    currency: 'diamond',
    colors: { primary: '#1a1a2e', secondary: '#4a4a69', accent: '#ffd700' },
    description: '星空图案的外套，神秘而华丽',
    tags: ['华丽', '神秘'],
    isOwned: false,
    isFavorite: false,
  },

  // 下装
  {
    id: 'bottom-1',
    name: '牛仔短裤',
    category: 'bottom',
    rarity: 'common',
    price: 100,
    currency: 'gold',
    colors: { primary: '#4a90d9', secondary: '#5a9de9' },
    description: '经典的牛仔短裤',
    tags: ['日常', '休闲'],
    isOwned: true,
    isFavorite: false,
  },
  {
    id: 'bottom-2',
    name: '粉色短裙',
    category: 'bottom',
    rarity: 'rare',
    price: 350,
    currency: 'gold',
    colors: { primary: '#ffb7c5', secondary: '#ffcdd2' },
    description: '可爱的粉色短裙',
    tags: ['可爱', '甜美'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'bottom-3',
    name: '格纹长裤',
    category: 'bottom',
    rarity: 'epic',
    price: 45,
    currency: 'diamond',
    colors: { primary: '#2c3e50', secondary: '#34495e', accent: '#e74c3c' },
    description: '经典格纹长裤',
    tags: ['学院', '复古'],
    isOwned: false,
    isFavorite: false,
  },

  // 连衣裙
  {
    id: 'dress-1',
    name: '碎花连衣裙',
    category: 'dress',
    rarity: 'rare',
    price: 600,
    currency: 'gold',
    colors: { primary: '#fff5f5', secondary: '#ffb7c5', accent: '#90EE90' },
    description: '清新的碎花连衣裙',
    tags: ['清新', '甜美'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'dress-2',
    name: '公主礼服',
    category: 'dress',
    rarity: 'legendary',
    price: 150,
    currency: 'diamond',
    colors: { primary: '#ffb7c5', secondary: '#ffcdd2', accent: '#ffd700' },
    description: '华丽的公主礼服',
    tags: ['华丽', '优雅'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'dress-3',
    name: '小黑裙',
    category: 'dress',
    rarity: 'epic',
    price: 60,
    currency: 'diamond',
    colors: { primary: '#1a1a1a', secondary: '#2d2d2d', accent: '#ff6b9d' },
    description: '经典的小黑裙',
    tags: ['优雅', '成熟'],
    isOwned: false,
    isFavorite: false,
  },

  // 鞋子
  {
    id: 'shoes-1',
    name: '白色运动鞋',
    category: 'shoes',
    rarity: 'common',
    price: 80,
    currency: 'gold',
    colors: { primary: '#ffffff', secondary: '#f0f0f0' },
    description: '舒适的白色运动鞋',
    tags: ['日常', '休闲'],
    isOwned: true,
    isFavorite: false,
  },
  {
    id: 'shoes-2',
    name: '粉色高跟鞋',
    category: 'shoes',
    rarity: 'rare',
    price: 450,
    currency: 'gold',
    colors: { primary: '#ffb7c5', secondary: '#ffcdd2' },
    description: '优雅的粉色高跟鞋',
    tags: ['优雅', '甜美'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'shoes-3',
    name: '水晶鞋',
    category: 'shoes',
    rarity: 'legendary',
    price: 100,
    currency: 'diamond',
    colors: { primary: '#e0ffff', secondary: '#b0e0e6', accent: '#ffd700' },
    description: '童话般的水晶鞋',
    tags: ['华丽', '童话'],
    isOwned: false,
    isFavorite: false,
  },

  // 配饰
  {
    id: 'accessory-1',
    name: '蝴蝶结发饰',
    category: 'accessory',
    rarity: 'common',
    price: 50,
    currency: 'gold',
    colors: { primary: '#ff6b9d', secondary: '#ff8fab' },
    description: '可爱的蝴蝶结发饰',
    tags: ['可爱', '甜美'],
    isOwned: true,
    isFavorite: false,
  },
  {
    id: 'accessory-2',
    name: '珍珠项链',
    category: 'accessory',
    rarity: 'epic',
    price: 50,
    currency: 'diamond',
    colors: { primary: '#fff5ee', secondary: '#ffe4e1' },
    description: '优雅的珍珠项链',
    tags: ['优雅', '经典'],
    isOwned: false,
    isFavorite: false,
  },
  {
    id: 'accessory-3',
    name: '星星耳环',
    category: 'accessory',
    rarity: 'rare',
    price: 300,
    currency: 'gold',
    colors: { primary: '#ffd700', secondary: '#ffec8b' },
    description: '闪耀的星星耳环',
    tags: ['可爱', '闪耀'],
    isOwned: false,
    isFavorite: false,
  },
]

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9e9e9e',
  rare: '#4fc3f7',
  epic: '#ba68c8',
  legendary: '#ffd700',
}

export const RARITY_NAMES: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

export const CATEGORY_NAMES: Record<ClothesCategory, string> = {
  hair: '发型',
  top: '上装',
  bottom: '下装',
  dress: '连衣裙',
  shoes: '鞋子',
  accessory: '配饰',
}
