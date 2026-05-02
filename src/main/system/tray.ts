import { Tray, Menu, nativeImage, app } from 'electron'
import path from 'path'
import { showWindow, hideWindow, getWindow } from './window'

let tray: Tray | null = null

function createDefaultIcon(): Electron.NativeImage {
  const size = 64
  const canvas = Buffer.alloc(size * size * 4)
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const cx = size / 2
      const cy = size / 2
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      
      if (dist < size / 2 - 2) {
        canvas[idx] = 102
        canvas[idx + 1] = 126
        canvas[idx + 2] = 234
        canvas[idx + 3] = 255
      } else {
        canvas[idx + 3] = 0
      }
    }
  }
  
  return nativeImage.createFromBuffer(canvas, { width: size, height: size })
}

export function createTray(): Tray {
  let icon: Electron.NativeImage
  
  const iconPath = path.join(
    __dirname,
    process.env.NODE_ENV === 'development'
      ? '../../resources/icon.png'
      : '../resources/icon.png'
  )

  try {
    const loadedIcon = nativeImage.createFromPath(iconPath)
    if (!loadedIcon.isEmpty()) {
      icon = loadedIcon
    } else {
      icon = createDefaultIcon()
    }
  } catch {
    icon = createDefaultIcon()
  }

  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => showWindow(),
    },
    {
      label: '隐藏',
      click: () => hideWindow(),
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => {
        showWindow()
        getWindow()?.webContents.send('open-settings')
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setToolTip('桌宠')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    showWindow()
  })

  tray.on('double-click', () => {
    showWindow()
  })

  return tray
}

export function getTray(): Tray | null {
  return tray
}

export function updateTrayIcon(iconPath: string): void {
  if (tray) {
    const icon = nativeImage.createFromPath(iconPath)
    if (!icon.isEmpty()) {
      tray.setImage(icon.resize({ width: 16, height: 16 }))
    }
  }
}

export function updateTrayTooltip(tooltip: string): void {
  if (tray) {
    tray.setToolTip(tooltip)
  }
}
