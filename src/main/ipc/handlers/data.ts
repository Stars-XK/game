import { ipcMain, dialog } from 'electron'
import Store from 'electron-store'
import * as fs from 'fs'
import * as path from 'path'
import { IPC_CHANNELS } from '../channels'

const store = new Store()

interface ExportData {
  version: string
  exportedAt: number
  config: Record<string, unknown>
  achievements: {
    progress: Record<string, unknown>
    stats: Record<string, number>
  }
  chatHistory: {
    sessions: unknown[]
    currentSessionId: string | null
  }
}

const APP_VERSION = '1.0.0'

export function registerDataHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.DATA.EXPORT, async (event) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: '导出数据',
        defaultPath: `desktop-pet-backup-${Date.now()}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (!filePath) {
        return { success: false, message: '用户取消导出' }
      }

      const exportData: ExportData = {
        version: APP_VERSION,
        exportedAt: Date.now(),
        config: (store.get('config') as Record<string, unknown>) || {},
        achievements: {
          progress: (store.get('achievements.progress') as Record<string, unknown>) || {},
          stats: (store.get('achievements.stats') as Record<string, number>) || {},
        },
        chatHistory: {
          sessions: (store.get('chatHistory.sessions') as unknown[]) || [],
          currentSessionId: store.get('chatHistory.currentSessionId') as string | null,
        },
      }

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8')

      return { success: true, message: '导出成功', filePath }
    } catch (error) {
      console.error('Export failed:', error)
      return { success: false, message: `导出失败: ${error}` }
    }
  })

  ipcMain.handle(IPC_CHANNELS.DATA.IMPORT, async (event) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: '导入数据',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      })

      if (!filePaths || filePaths.length === 0) {
        return { success: false, message: '用户取消导入' }
      }

      const filePath = filePaths[0]
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const importData: ExportData = JSON.parse(fileContent)

      if (importData.config) {
        store.set('config', importData.config)
      }
      if (importData.achievements) {
        store.set('achievements', importData.achievements)
      }
      if (importData.chatHistory) {
        store.set('chatHistory', importData.chatHistory)
      }

      return { success: true, message: '导入成功' }
    } catch (error) {
      console.error('Import failed:', error)
      return { success: false, message: `导入失败: ${error}` }
    }
  })

  ipcMain.handle(IPC_CHANNELS.DATA.RESET, async (event) => {
    try {
      const { response } = await dialog.showMessageBox({
        type: 'warning',
        title: '确认重置',
        message: '确定要重置所有数据吗？此操作不可恢复。',
        buttons: ['取消', '确认重置'],
        defaultId: 0,
        cancelId: 0,
      })

      if (response === 1) {
        store.clear()
        return { success: true, message: '数据已重置' }
      }

      return { success: false, message: '用户取消重置' }
    } catch (error) {
      console.error('Reset failed:', error)
      return { success: false, message: `重置失败: ${error}` }
    }
  })
}
