import { registerConfigHandlers } from './config'
import { registerWindowHandlers } from './window'
import { registerAIHandlers } from '../../services/ai'
import { registerScreenHandlers } from './screen'
import { registerAchievementHandlers } from './achievement'
import { registerChatHandlers } from './chat'
import { registerDataHandlers } from './data'

export function registerAllHandlers(): void {
  registerConfigHandlers()
  registerWindowHandlers()
  registerAIHandlers()
  registerScreenHandlers()
  registerAchievementHandlers()
  registerChatHandlers()
  registerDataHandlers()
}
