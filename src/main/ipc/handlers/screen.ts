import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../channels'
import { captureScreen } from '../../hardware/screen'
import { analyzeScene } from '../../services/sceneAnalyzer'

export function registerScreenHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SCREEN.CAPTURE, async () => {
    return await captureScreen()
  })

  ipcMain.handle(IPC_CHANNELS.SCREEN.ANALYZE_SCENE, async () => {
    return await analyzeScene()
  })
}
