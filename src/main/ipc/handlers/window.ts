import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../channels'
import {
  showWindow,
  hideWindow,
  setAlwaysOnTop,
  setWindowPosition,
  getWindowPosition,
  setMousePassthrough,
} from '../../system/window'

export function registerWindowHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW.SHOW, () => {
    showWindow()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW.HIDE, () => {
    hideWindow()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_ALWAYS_ON_TOP, (_event, value: boolean) => {
    setAlwaysOnTop(value)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_POSITION, (_event, x: number, y: number) => {
    setWindowPosition(x, y)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW.GET_POSITION, () => {
    return getWindowPosition()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_MOUSE_PASSTHROUGH, (_event, enabled: boolean) => {
    setMousePassthrough(enabled)
  })
}
