import { BrowserWindow, screen } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

export function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    x: width - 450,
    y: height - 450,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

export function getWindow(): BrowserWindow | null {
  return mainWindow
}

export function showWindow(): void {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
}

export function hideWindow(): void {
  if (mainWindow) {
    mainWindow.hide()
  }
}

export function setAlwaysOnTop(value: boolean): void {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(value)
  }
}

export function setWindowPosition(x: number, y: number): void {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y))
  }
}

export function getWindowPosition(): { x: number; y: number } | null {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition()
    return { x, y }
  }
  return null
}
