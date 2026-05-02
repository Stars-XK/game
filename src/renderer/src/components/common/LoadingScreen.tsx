import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  message?: string
  progress?: number
}

export function LoadingScreen({ message = '加载中...', progress }: LoadingScreenProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-pet">
          <div className="loading-body"></div>
          <div className="loading-face">
            <div className="loading-eye left"></div>
            <div className="loading-eye right"></div>
            <div className="loading-mouth"></div>
          </div>
        </div>
        <div className="loading-text">
          {message}
          {dots}
        </div>
        {progress !== undefined && (
          <div className="loading-progress">
            <div className="loading-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  )
}
