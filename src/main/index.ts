import { app } from 'electron'
import { createWindow } from './system/window'
import { createTray } from './system/tray'
import { registerAllHandlers } from './ipc/handlers'

let mainWindow: Electron.BrowserWindow | null = null

app.whenReady().then(() => {
  registerAllHandlers()
  mainWindow = createWindow()
  createTray()

  app.on('activate', () => {
    if (!mainWindow) {
      mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  mainWindow = null
})
