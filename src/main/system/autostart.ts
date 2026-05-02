import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const APP_NAME = 'DesktopPet'
const APP_ID = 'com.desktop-pet.app'

export async function isAutoStartEnabled(): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const keyPath = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`
      const { stdout } = await execAsync(`reg query "${keyPath}" /v ${APP_NAME}`, { encoding: 'utf8' })
      return stdout.includes(APP_NAME)
    } else if (process.platform === 'darwin') {
      const plistPath = path.join(app.getPath('home'), 'Library', 'LaunchAgents', `${APP_ID}.plist`)
      return fs.existsSync(plistPath)
    } else if (process.platform === 'linux') {
      const autostartPath = path.join(app.getPath('home'), '.config', 'autostart', `${APP_NAME}.desktop`)
      return fs.existsSync(autostartPath)
    }
    return false
  } catch {
    return false
  }
}

export async function enableAutoStart(): Promise<boolean> {
  try {
    const appPath = app.getPath('exe')
    
    if (process.platform === 'win32') {
      const keyPath = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`
      await execAsync(`reg add "${keyPath}" /v ${APP_NAME} /t REG_SZ /d "${appPath}" /f`)
      return true
    } else if (process.platform === 'darwin') {
      const plistPath = path.join(app.getPath('home'), 'Library', 'LaunchAgents', `${APP_ID}.plist`)
      const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${APP_ID}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${appPath}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>`
      fs.mkdirSync(path.dirname(plistPath), { recursive: true })
      fs.writeFileSync(plistPath, plistContent)
      return true
    } else if (process.platform === 'linux') {
      const autostartPath = path.join(app.getPath('home'), '.config', 'autostart', `${APP_NAME}.desktop`)
      const desktopContent = `[Desktop Entry]
Type=Application
Name=${APP_NAME}
Exec="${appPath}"
Icon=${APP_NAME}
Comment=Desktop Pet Application
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true`
      fs.mkdirSync(path.dirname(autostartPath), { recursive: true })
      fs.writeFileSync(autostartPath, desktopContent)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to enable auto start:', error)
    return false
  }
}

export async function disableAutoStart(): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const keyPath = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`
      await execAsync(`reg delete "${keyPath}" /v ${APP_NAME} /f`)
      return true
    } else if (process.platform === 'darwin') {
      const plistPath = path.join(app.getPath('home'), 'Library', 'LaunchAgents', `${APP_ID}.plist`)
      if (fs.existsSync(plistPath)) {
        fs.unlinkSync(plistPath)
      }
      return true
    } else if (process.platform === 'linux') {
      const autostartPath = path.join(app.getPath('home'), '.config', 'autostart', `${APP_NAME}.desktop`)
      if (fs.existsSync(autostartPath)) {
        fs.unlinkSync(autostartPath)
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to disable auto start:', error)
    return false
  }
}

export async function setAutoStart(enabled: boolean): Promise<boolean> {
  if (enabled) {
    return enableAutoStart()
  } else {
    return disableAutoStart()
  }
}
