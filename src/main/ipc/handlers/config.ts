import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../channels'
import { AppConfig } from '@shared/types/config'
import { getConfig, setConfig, resetConfig } from '../../config/store'

export { getConfig }

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG.GET, () => getConfig())

  ipcMain.handle(IPC_CHANNELS.CONFIG.SET, async (_event, config: Partial<AppConfig>) => {
    return await setConfig(config)
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG.RESET, () => resetConfig())
}
