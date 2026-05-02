import { desktopCapturer } from 'electron'

export type SceneType =
  | 'idle'
  | 'working'
  | 'gaming'
  | 'watching_video'
  | 'browsing'
  | 'coding'
  | 'meeting'
  | 'unknown'

export interface SceneAnalysisResult {
  scene: SceneType
  confidence: number
  keywords: string[]
  timestamp: number
  windowTitle?: string
}

const SCENE_KEYWORDS: Record<SceneType, string[]> = {
  idle: [],
  working: ['document', 'word', 'excel', 'powerpoint', 'pdf', 'office', '工作', '文档', 'wps', 'notion', 'obsidian'],
  gaming: ['game', '游戏', 'steam', 'epic', 'league', 'minecraft', 'genshin', '原神', 'lol', 'csgo', 'dota', 'valorant', 'overwatch'],
  watching_video: ['youtube', 'bilibili', 'netflix', 'video', '视频', '电影', 'movie', '直播', 'youku', 'iqiyi', 'tencent video'],
  browsing: ['chrome', 'firefox', 'edge', 'browser', '浏览器', '搜索', 'google', 'bing', 'safari', 'opera'],
  coding: ['visual studio', 'vscode', 'code', '编程', '代码', 'github', 'git', 'terminal', '终端', 'idea', 'webstorm', 'sublime', 'atom', 'cursor'],
  meeting: ['zoom', 'teams', 'meet', '会议', 'meeting', '腾讯会议', '钉钉', '飞书', 'discord', 'slack', 'skype'],
  unknown: [],
}

export async function analyzeScene(): Promise<SceneAnalysisResult> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 0, height: 0 }
    })

    const activeWindow = sources.find(source => 
      source.id.startsWith('window:') && 
      source.name && 
      source.name !== '' &&
      !source.name.includes('Electron') &&
      !source.name.includes('桌面宠物')
    )

    if (!activeWindow) {
      return {
        scene: 'idle',
        confidence: 0.8,
        keywords: [],
        timestamp: Date.now(),
      }
    }

    const windowTitle = activeWindow.name.toLowerCase()
    const detectedScene = detectSceneFromTitle(windowTitle)

    return {
      ...detectedScene,
      timestamp: Date.now(),
      windowTitle: activeWindow.name,
    }
  } catch (error) {
    console.error('Scene analysis error:', error)
    return {
      scene: 'unknown',
      confidence: 0,
      keywords: [],
      timestamp: Date.now(),
    }
  }
}

function detectSceneFromTitle(
  windowTitle: string
): { scene: SceneType; confidence: number; keywords: string[] } {
  const detectedKeywords: string[] = []
  let bestMatch: SceneType = 'idle'
  let bestScore = 0

  for (const [sceneType, keywords] of Object.entries(SCENE_KEYWORDS)) {
    if (sceneType === 'idle' || sceneType === 'unknown') continue

    const matchedKeywords = keywords.filter((keyword) =>
      windowTitle.includes(keyword.toLowerCase())
    )

    if (matchedKeywords.length > bestScore) {
      bestScore = matchedKeywords.length
      bestMatch = sceneType as SceneType
      detectedKeywords.push(...matchedKeywords)
    }
  }

  const confidence = bestScore > 0 ? Math.min(bestScore / 2 + 0.3, 1) : 0.5

  return {
    scene: bestScore > 0 ? bestMatch : 'idle',
    confidence,
    keywords: detectedKeywords,
  }
}

export function getSceneDescription(scene: SceneType): string {
  const descriptions: Record<SceneType, string> = {
    idle: '空闲中',
    working: '工作中',
    gaming: '游戏中',
    watching_video: '看视频中',
    browsing: '浏览网页',
    coding: '编程中',
    meeting: '会议中',
    unknown: '未知',
  }
  return descriptions[scene]
}

export function getSceneInteractionPrompt(scene: SceneType): string {
  const prompts: Record<SceneType, string> = {
    idle: '主人，你好像没什么事情做呢，要不要和我聊聊天？',
    working: '主人工作辛苦了，记得休息一下哦~',
    gaming: '哇，主人在玩游戏呢！看起来很有趣的样子~',
    watching_video: '主人正在看视频呢，不打扰你了~',
    browsing: '主人在浏览网页呀，有什么有趣的事情吗？',
    coding: '主人在写代码呢，好厉害！遇到问题可以问我哦~',
    meeting: '主人在开会，我会安静地陪着你的~',
    unknown: '主人，你在做什么呢？',
  }
  return prompts[scene]
}
