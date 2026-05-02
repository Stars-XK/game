import { desktopCapturer, DesktopCapturerSource } from 'electron'

export interface ScreenCaptureResult {
  dataUrl: string
  width: number
  height: number
  timestamp: number
}

export async function captureScreen(): Promise<ScreenCaptureResult | null> {
  try {
    const sources: DesktopCapturerSource[] = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 800, height: 600 },
    })

    if (sources.length === 0) {
      return null
    }

    const primaryScreen = sources[0]
    const thumbnail = primaryScreen.thumbnail

    return {
      dataUrl: thumbnail.toDataURL(),
      width: thumbnail.getSize().width,
      height: thumbnail.getSize().height,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Screen capture failed:', error)
    return null
  }
}

export async function captureWindow(windowName?: string): Promise<ScreenCaptureResult | null> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 800, height: 600 },
    })

    if (sources.length === 0) {
      return null
    }

    const targetSource = windowName
      ? sources.find((s) => s.name.includes(windowName))
      : sources[0]

    if (!targetSource) {
      return null
    }

    const thumbnail = targetSource.thumbnail

    return {
      dataUrl: thumbnail.toDataURL(),
      width: thumbnail.getSize().width,
      height: thumbnail.getSize().height,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Window capture failed:', error)
    return null
  }
}
