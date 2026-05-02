import { useState, useEffect } from 'react'

interface GuideStep {
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

interface OnboardingGuideProps {
  onComplete: () => void
}

const GUIDE_STEPS: GuideStep[] = [
  {
    target: 'pet',
    title: '欢迎！',
    content: '这是你的桌宠，点击可以互动，双击可以聊天，右键可以设置',
    position: 'bottom',
  },
  {
    target: 'actions',
    title: '功能按钮',
    content: '这里可以换装、玩游戏、查看成就',
    position: 'top',
  },
  {
    target: 'chat',
    title: 'AI 聊天',
    content: '双击桌宠打开聊天窗口，与你的桌宠对话吧！',
    position: 'right',
  },
]

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide')
    if (!hasSeenGuide) {
      setIsVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenGuide', 'true')
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isVisible) return null

  const step = GUIDE_STEPS[currentStep]

  return (
    <div className="guide-overlay">
      <div className="guide-content">
        <div className="guide-progress">
          {GUIDE_STEPS.map((_, index) => (
            <div
              key={index}
              className={`guide-dot ${index === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
        <h3 className="guide-title">{step.title}</h3>
        <p className="guide-text">{step.content}</p>
        <div className="guide-actions">
          <button className="guide-skip-btn" onClick={handleSkip}>
            跳过
          </button>
          <button className="guide-next-btn" onClick={handleNext}>
            {currentStep < GUIDE_STEPS.length - 1 ? '下一步' : '完成'}
          </button>
        </div>
      </div>
    </div>
  )
}
