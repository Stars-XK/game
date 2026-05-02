import { Notification, NotificationConstructorOptions } from 'electron'

export interface NotifyOptions {
  title: string
  body: string
  icon?: string
  silent?: boolean
  onClick?: () => void
}

class NotificationManager {
  private enabled: boolean = true
  private quietHours: { start: number; end: number } | null = null

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setQuietHours(start: number, end: number): void {
    this.quietHours = { start, end }
  }

  isInQuietHours(): boolean {
    if (!this.quietHours) return false

    const now = new Date()
    const currentHour = now.getHours() + now.getMinutes() / 60
    const { start, end } = this.quietHours

    if (start < end) {
      return currentHour >= start && currentHour < end
    } else {
      return currentHour >= start || currentHour < end
    }
  }

  show(options: NotifyOptions): Notification | null {
    if (!this.enabled) return null
    if (this.isInQuietHours()) return null

    if (!Notification.isSupported()) {
      console.warn('Notifications are not supported')
      return null
    }

    const notificationOptions: NotificationConstructorOptions = {
      title: options.title,
      body: options.body,
      silent: options.silent ?? false,
    }

    if (options.icon) {
      notificationOptions.icon = options.icon
    }

    const notification = new Notification(notificationOptions)

    if (options.onClick) {
      notification.on('click', options.onClick)
    }

    notification.show()
    return notification
  }

  showAchievement(achievementName: string): Notification | null {
    return this.show({
      title: '🎉 成就解锁！',
      body: `恭喜获得成就：${achievementName}`,
      silent: false,
    })
  }

  showReminder(type: 'rest' | 'water' | 'stretch'): Notification | null {
    const messages: Record<string, { title: string; body: string }> = {
      rest: {
        title: '☕ 该休息一下了',
        body: '你已经工作很久了，休息一下吧！',
      },
      water: {
        title: '💧 记得喝水',
        body: '保持水分补充，身体更健康哦~',
      },
      stretch: {
        title: '🧘 起来活动一下',
        body: '久坐伤身，起来伸展一下吧！',
      },
    }

    const message = messages[type]
    return this.show({
      title: message.title,
      body: message.body,
      silent: true,
    })
  }

  showInteraction(message: string): Notification | null {
    return this.show({
      title: '💬 小萌有话说',
      body: message,
      silent: true,
    })
  }
}

export const notificationManager = new NotificationManager()
