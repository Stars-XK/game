export type ExportDataType = 'config' | 'chat' | 'achievements' | 'appearance' | 'all'

export interface ExportData {
  version: string
  exportedAt: number
  type: ExportDataType
  data: Record<string, unknown>
}

export interface ImportResult {
  success: boolean
  message: string
  importedTypes: string[]
}
