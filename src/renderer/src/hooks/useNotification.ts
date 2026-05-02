import { useCallback, useEffect, useState } from 'react'

interface UseNotificationOptions {
  enabled?: boolean
}

export function useNotification(options: UseNotificationOptions = {}) {
  const { enabled = true } = options
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (!enabled) return

    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [enabled])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return true
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    }

    return false
  }, [])

  const show = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!enabled || permission !== 'granted') return null

      try {
        const notification = new Notification(title, options)
        return notification
      } catch (error) {
        console.error('Failed to show notification:', error)
        return null
      }
    },
    [enabled, permission]
  )

  const showAchievement = useCallback(
    (achievementName: string) => {
      return show('🎉 成就解锁！', {
        body: `恭喜获得成就：${achievementName}`,
        icon: '🏆',
      })
    },
    [show]
  )

  const showReminder = useCallback(
    (type: 'rest' | 'water') => {
      const messages = {
        rest: {
          title: '🧘 休息提醒',
          body: '久坐伤身，起来伸展一下吧！',
        },
        water: {
          title: '💧 喝水提醒',
          body: '记得补充水分哦~',
        },
      }

      const msg = messages[type]
      return show(msg.title, { body: msg.body })
    },
    [show]
  )

  return {
    permission,
    requestPermission,
    show,
    showAchievement,
    showReminder,
    isSupported: 'Notification' in window,
  }
}
