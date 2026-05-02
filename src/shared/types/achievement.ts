export type AchievementCategory = 'interaction' | 'game' | 'dressup' | 'chat' | 'special'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  requirement: number
  reward?: string
  unlockedAt?: number
}

export interface AchievementProgress {
  achievementId: string
  current: number
  target: number
  unlocked: boolean
  unlockedAt?: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_chat',
    name: '初次对话',
    description: '与桌宠进行第一次聊天',
    icon: '💬',
    category: 'chat',
    requirement: 1,
  },
  {
    id: 'chat_10',
    name: '话痨',
    description: '与桌宠聊天 10 次',
    icon: '🗣️',
    category: 'chat',
    requirement: 10,
  },
  {
    id: 'chat_100',
    name: '知己',
    description: '与桌宠聊天 100 次',
    icon: '💕',
    category: 'chat',
    requirement: 100,
  },
  {
    id: 'chat_500',
    name: '灵魂伴侣',
    description: '与桌宠聊天 500 次',
    icon: '💖',
    category: 'chat',
    requirement: 500,
    reward: '解锁专属称号',
  },
  {
    id: 'first_game',
    name: '游戏新手',
    description: '完成第一局游戏',
    icon: '🎮',
    category: 'game',
    requirement: 1,
  },
  {
    id: 'game_win_10',
    name: '游戏达人',
    description: '在游戏中获胜 10 次',
    icon: '🏆',
    category: 'game',
    requirement: 10,
  },
  {
    id: 'game_win_50',
    name: '游戏大师',
    description: '在游戏中获胜 50 次',
    icon: '👑',
    category: 'game',
    requirement: 50,
  },
  {
    id: 'game_win_100',
    name: '游戏传奇',
    description: '在游戏中获胜 100 次',
    icon: '🎯',
    category: 'game',
    requirement: 100,
    reward: '解锁传奇皮肤',
  },
  {
    id: 'first_dressup',
    name: '换装新手',
    description: '第一次更换服装',
    icon: '👗',
    category: 'dressup',
    requirement: 1,
  },
  {
    id: 'dressup_10',
    name: '时尚达人',
    description: '更换服装 10 次',
    icon: '✨',
    category: 'dressup',
    requirement: 10,
  },
  {
    id: 'dressup_50',
    name: '时尚大师',
    description: '更换服装 50 次',
    icon: '💎',
    category: 'dressup',
    requirement: 50,
  },
  {
    id: 'dressup_100',
    name: '时尚女王',
    description: '更换服装 100 次',
    icon: '👑',
    category: 'dressup',
    requirement: 100,
    reward: '解锁专属套装',
  },
  {
    id: 'click_100',
    name: '摸摸头',
    description: '点击桌宠 100 次',
    icon: '👆',
    category: 'interaction',
    requirement: 100,
  },
  {
    id: 'click_500',
    name: '爱不释手',
    description: '点击桌宠 500 次',
    icon: '🤗',
    category: 'interaction',
    requirement: 500,
  },
  {
    id: 'click_1000',
    name: '灵魂伴侣',
    description: '点击桌宠 1000 次',
    icon: '💖',
    category: 'interaction',
    requirement: 1000,
    reward: '解锁终极称号',
  },
  {
    id: 'hours_1',
    name: '一小时陪伴',
    description: '与桌宠相处 1 小时',
    icon: '⏰',
    category: 'special',
    requirement: 1,
  },
  {
    id: 'hours_24',
    name: '一日相伴',
    description: '与桌宠相处 24 小时',
    icon: '📅',
    category: 'special',
    requirement: 24,
  },
  {
    id: 'hours_168',
    name: '一周相伴',
    description: '与桌宠相处 168 小时（7天）',
    icon: '📆',
    category: 'special',
    requirement: 168,
  },
  {
    id: 'hours_720',
    name: '一月相伴',
    description: '与桌宠相处 720 小时（30天）',
    icon: '🗓️',
    category: 'special',
    requirement: 720,
  },
  {
    id: 'hours_8760',
    name: '一年相伴',
    description: '与桌宠相处 8760 小时（365天）',
    icon: '🎂',
    category: 'special',
    requirement: 8760,
    reward: '解锁永久称号',
  },
]

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category)
}
