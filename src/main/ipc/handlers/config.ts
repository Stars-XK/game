import { ipcMain } from 'electron'
import Store from 'electron-store'
import { IPC_CHANNELS } from '../channels'
import { AppConfig, DEFAULT_CONFIG } from '@shared/types/config'
import { setAutoStart, isAutoStartEnabled } from '../../system/autostart'

const store = new Store<{ config: AppConfig }>()

export function getConfig(): AppConfig {
  return store.get('config', DEFAULT_CONFIG)
}

export async function setConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  const currentConfig = getConfig()
  const newConfig = { ...currentConfig, ...config }
  store.set('config', newConfig)

  
  if (currentConfig.autoStart !== newConfig.autoStart) {
    try {
      await setAutoStart(newConfig.autoStart)
    } catch (error) {
      console.error('Failed to set auto start:', error)
    }
  }
  
  return newConfig
}

export function resetConfig(): AppConfig {
  store.set('config', DEFAULT_CONFIG)
  return DEFAULT_CONFIG
}

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG.GET, () => {
    return getConfig()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG.SET, async (_event, config: Partial<AppConfig>) => {
    return await setConfig(config)
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG.RESET, () => {
    return resetConfig()
  })
}
