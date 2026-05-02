import { useState, useEffect } from 'react'
import { PersonalityType, PERSONALITY_CONFIGS } from '@shared/data/personality'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [petName, setPetName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiBaseUrl, setApiBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [autoStart, setAutoStart] = useState(false)
  const [alwaysOnTop, setAlwaysOnTop] = useState(true)
  const [interactionRange, setInteractionRange] = useState<'screen' | 'window'>('screen')
  const [debugMode, setDebugMode] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [language, setLanguage] = useState('zh-CN')
  const [personalityType, setPersonalityType] = useState<PersonalityType>('cheerful')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dataMessage, setDataMessage] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.config.get()
      setPetName(config.petName as string)
      setOwnerName(config.ownerName as string)
      setApiKey(config.openaiApiKey as string)
      setApiBaseUrl(config.openaiBaseUrl as string)
      setModel(config.model as string)
      setAutoStart(config.autoStart as boolean)
      setAlwaysOnTop(config.alwaysOnTop as boolean)
      setInteractionRange(config.interactionRange as 'screen' | 'window')
      setDebugMode(config.debugMode as boolean)
      setTheme(config.theme as 'light' | 'dark' | 'auto')
      setLanguage(config.language as string)
      setPersonalityType((config as any).personalityType as PersonalityType || 'cheerful')
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await window.electronAPI.config.set({
        petName,
        ownerName,
        openaiApiKey: apiKey,
        openaiBaseUrl: apiBaseUrl,
        model,
        autoStart,
        alwaysOnTop,
        interactionRange,
        debugMode,
        theme,
        language,
        personalityType,
      })
      await window.electronAPI.window.setAlwaysOnTop(alwaysOnTop)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      await window.electronAPI.config.reset()
      await loadConfig()
    } catch (error) {
      console.error('Failed to reset config:', error)
    }
  }

  const handleExport = async () => {
    try {
      const result = await window.electronAPI.data.export()
      setDataMessage(result.message)
      setTimeout(() => setDataMessage(''), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setDataMessage('导出失败')
    }
  }

  const handleImport = async () => {
    try {
      const result = await window.electronAPI.data.import()
      setDataMessage(result.message)
      if (result.success) {
        await loadConfig()
      }
      setTimeout(() => setDataMessage(''), 3000)
    } catch (error) {
      console.error('Import failed:', error)
      setDataMessage('导入失败')
    }
  }

  const handleResetAll = async () => {
    try {
      const result = await window.electronAPI.data.reset()
      setDataMessage(result.message)
      if (result.success) {
        await loadConfig()
      }
      setTimeout(() => setDataMessage(''), 3000)
    } catch (error) {
      console.error('Reset failed:', error)
      setDataMessage('重置失败')
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel settings-panel-large" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="settings-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="settings-content">
          <div className="settings-section">
            <h3>基本信息</h3>
            <div className="settings-field">
              <label>桌宠名字</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="输入桌宠名字"
              />
            </div>
            <div className="settings-field">
              <label>主人名字</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="输入主人名字"
              />
            </div>
            <div className="settings-field">
              <label>性格类型</label>
              <select 
                value={personalityType} 
                onChange={(e) => setPersonalityType(e.target.value as PersonalityType)}
              >
                {Object.entries(PERSONALITY_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.traits.slice(0, 2).join('・')}
                  </option>
                ))}
              </select>
              <div className="settings-hint" style={{ marginTop: 4 }}>
                {PERSONALITY_CONFIGS[personalityType]?.speakingStyle}
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>外观设置</h3>
            <div className="settings-field">
              <label>主题</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}>
                <option value="auto">跟随系统</option>
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </div>
            <div className="settings-field">
              <label>语言</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>行为设置</h3>
            <div className="settings-field settings-field-row">
              <label>开机自启动</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-field settings-field-row">
              <label>窗口置顶</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={alwaysOnTop}
                  onChange={(e) => setAlwaysOnTop(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-field">
              <label>互动范围</label>
              <select
                value={interactionRange}
                onChange={(e) => setInteractionRange(e.target.value as 'screen' | 'window')}
              >
                <option value="screen">整个屏幕</option>
                <option value="window">仅游戏窗口</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>AI 配置</h3>
            <div className="settings-field">
              <label>OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="settings-field">
              <label>API Base URL</label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="settings-field">
              <label>模型</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>数据管理</h3>
            <div className="data-actions">
              <button className="data-btn export-btn" onClick={handleExport}>
                📤 导出数据
              </button>
              <button className="data-btn import-btn" onClick={handleImport}>
                📥 导入数据
              </button>
              <button className="data-btn reset-btn" onClick={handleResetAll}>
                🗑️ 重置所有数据
              </button>
            </div>
            {dataMessage && (
              <div className="data-message">{dataMessage}</div>
            )}
          </div>

          <div className="settings-section">
            <h3>开发者选项</h3>
            <div className="settings-field settings-field-row">
              <label>调试模式</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-hint">
              开启后将在控制台输出调试信息
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn-reset" onClick={handleReset}>
              重置默认
            </button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : saved ? '已保存!' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
