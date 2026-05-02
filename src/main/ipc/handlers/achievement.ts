import { ipcMain } from 'electron'
import Store from 'electron-store'
import { IPC_CHANNELS } from '../channels'
import { Achievement, AchievementProgress, ACHIEVEMENTS } from '@shared/types/achievement'

interface AchievementData {
  progress: Record<string, AchievementProgress>
  stats: {
    chatCount: number
    gameCount: number
    gameWins: number
    dressupCount: number
    clickCount: number
    totalHours: number
  }
}

const store = new Store<{ achievements: AchievementData }>()

const DEFAULT_DATA: AchievementData = {
  progress: {},
  stats: {
    chatCount: 0,
    gameCount: 0,
    gameWins: 0,
    dressupCount: 0,
    clickCount: 0,
    totalHours: 0,
  },
}

function getAchievementData(): AchievementData {
  return store.get('achievements', DEFAULT_DATA)
}

function setAchievementData(data: AchievementData): void {
  store.set('achievements', data)
}

function checkAchievement(achievementId: string, current: number): boolean {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!achievement) return false

  return current >= achievement.requirement
}

export function updateStat(stat: keyof AchievementData['stats'], value: number): Achievement[] {
  const data = getAchievementData()
  data.stats[stat] = value

  const newlyUnlocked: Achievement[] = []

  const relevantAchievements = ACHIEVEMENTS.filter((a) => {
    if (stat === 'chatCount' && a.category === 'chat') return true
    if (stat === 'gameWins' && a.category === 'game') return true
    if (stat === 'dressupCount' && a.category === 'dressup') return true
    if (stat === 'clickCount' && a.category === 'interaction') return true
    if (stat === 'totalHours' && a.category === 'special') return true
    return false
  })

  for (const achievement of relevantAchievements) {
    const existingProgress = data.progress[achievement.id]
    if (existingProgress?.unlocked) continue

    const isUnlocked = checkAchievement(achievement.id, value)

    data.progress[achievement.id] = {
      achievementId: achievement.id,
      current: value,
      target: achievement.requirement,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? Date.now() : undefined,
    }

    if (isUnlocked && !existingProgress?.unlocked) {
      newlyUnlocked.push(achievement)
    }
  }

  setAchievementData(data)
  return newlyUnlocked
}

export function incrementStat(stat: keyof AchievementData['stats']): Achievement[] {
  const data = getAchievementData()
  const newValue = data.stats[stat] + 1
  return updateStat(stat, newValue)
}

export function registerAchievementHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.ACHIEVEMENT.GET_ALL, (): AchievementData => {
    return getAchievementData()
  })

  ipcMain.handle(IPC_CHANNELS.ACHIEVEMENT.GET_PROGRESS, (): Record<string, AchievementProgress> => {
    return getAchievementData().progress
  })

  ipcMain.handle(IPC_CHANNELS.ACHIEVEMENT.GET_STATS, (): AchievementData['stats'] => {
    return getAchievementData().stats
  })

  ipcMain.handle(
    IPC_CHANNELS.ACHIEVEMENT.UPDATE_STAT,
    (_event, stat: keyof AchievementData['stats'], value: number): Achievement[] => {
      return updateStat(stat, value)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.ACHIEVEMENT.INCREMENT_STAT,
    (_event, stat: keyof AchievementData['stats']): Achievement[] => {
      return incrementStat(stat)
    }
  )
}
