export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  data?: unknown
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs: number = 1000
  private debugMode: boolean = false

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    }

    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    if (this.debugMode || level === 'error' || level === 'warn') {
      const prefix = `[${level.toUpperCase()}]`
      const timestamp = new Date(entry.timestamp).toLocaleTimeString()
      console.log(`${timestamp} ${prefix} ${message}`, data || '')
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.debugMode) {
      this.log('debug', message, data)
  }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level)
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(): string {
    const exportData = this.logs.map((log) => ({
      ...log,
      timestamp: new Date(log.timestamp).toISOString(),
    }))
    return JSON.stringify(exportData, null, 2)
  }

  getStats(): { total: number; byLevel: Record<LogLevel, number> } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    }

    this.logs.forEach((log) => {
      byLevel[log.level]++
    })

    return {
      total: this.logs.length,
      byLevel,
    }
  }
}

export const logger = new Logger()
