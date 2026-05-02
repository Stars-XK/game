import Store from 'electron-store'
import { AppConfig, DEFAULT_CONFIG } from '@shared/types/config'
import { setAutoStart } from '../system/autostart'

const store = new Store<{ config: AppConfig }>()

export function getConfig(): AppConfig {
  const stored = store.get('config')
  return { ...DEFAULT_CONFIG, ...(stored || {}) }
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
