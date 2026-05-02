export const IPC_CHANNELS = {
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
    RESET: 'config:reset',
  },
  AI: {
    CHAT: 'ai:chat',
    CHAT_STREAM: 'ai:chat-stream',
    STOP: 'ai:stop',
  },
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
    SHOW: 'window:show',
    HIDE: 'window:hide',
    SET_ALWAYS_ON_TOP: 'window:set-always-on-top',
    SET_POSITION: 'window:set-position',
    GET_POSITION: 'window:get-position',
    SET_MOUSE_PASSTHROUGH: 'window:set-mouse-passthrough',
  },
  PET: {
    GET_STATE: 'pet:get-state',
    SET_STATE: 'pet:set-state',
  },
  SCREEN: {
    CAPTURE: 'screen:capture',
    ANALYZE_SCENE: 'screen:analyze-scene',
  },
  ACHIEVEMENT: {
    GET_ALL: 'achievement:get-all',
    GET_PROGRESS: 'achievement:get-progress',
    GET_STATS: 'achievement:get-stats',
    UPDATE_STAT: 'achievement:update-stat',
    INCREMENT_STAT: 'achievement:increment-stat',
  },
  CHAT: {
    GET_HISTORY: 'chat:get-history',
    SAVE_HISTORY: 'chat:save-history',
    CLEAR_HISTORY: 'chat:clear-history',
    NEW_SESSION: 'chat:new-session',
    DELETE_SESSION: 'chat:delete-session',
  },
  DATA: {
    EXPORT: 'data:export',
    IMPORT: 'data:import',
    RESET: 'data:reset',
  },
} as const
