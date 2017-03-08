export const openLeaderboardModal = () => {
  return {
    type: 'OPEN_LEADERBOARD_MODAL',
    value: true
  }
}

export const closeLeaderboardModal = () => {
  return {
    type: 'CLOSE_LEADERBOARD_MODAL',
    value: false
  }
}

export const setResetEventsFlag = (value) => {
  return {
    type: 'SET_RESET_EVENTS_FLAG',
    value
  }
}

export const setKeyboardControl = (value) => {
  return {
    type: 'SET_KEYBOARD_CONTROL',
    value
  }
}

export const reduceToMaxChatMessages = () => {
  return {
    type: 'REDUCE_TO_MAX_CHAT_MESSAGES'
  }
}

export const addKillLogMessage = (value) => {
  return {
    type: 'ADD_KILL_LOG_MESSAGE',
    value
  }
}

export const removeKillLogMessage = (value) => {
  return {
    type: 'REMOVE_KILL_LOG_MESSAGE',
    value
  }
}

export const setChatMessages = (value) => {
  return {
    type: 'SET_CHAT_MESSAGES',
    value
  }
}

export const addChatMessage = (value) => {
  return {
    type: 'ADD_CHAT_MESSAGE',
    value
  }
}

export const removeChatMessage = (value) => {
  return {
    type: 'REMOVE_CHAT_MESSAGE',
    value
  }
}

export const openSettingsModal = () => {
  return {
    type: 'OPEN_SETTINGS_MODAL',
    value: true
  }
}

export const closeSettingsModal = () => {
  return {
    type: 'CLOSE_SETTINGS_MODAL',
    value: false
  }
}

export const openChatModal = () => {
  return {
    type: 'OPEN_CHAT_MODAL',
    value: true
  }
}

export const closeChatModal = () => {
  return {
    type: 'CLOSE_CHAT_MODAL',
    value: false
  }
}

export const setShowKillConfirmed = (value) => {
  return {
    type: 'SET_SHOW_KILL_CONFIRMED',
    value
  }
}

export const setSettingsView = (value) => {
  return {
    type: 'SET_SETTINGS_VIEW',
    value
  }
}

export const setSfxVolume = (value) => {
  return {
    type: 'SET_SFX_VOLUME',
    value
  }
}

export const setSettingsModalView = (value) => {
  return {
    type: 'SET_SETTINGS_MODAL_VIEW',
    value
  }
}

export const setAutoRespawn = (value) => {
  return {
    type: 'SET_AUTO_RESPAWN',
    value
  }
}

export const setIsFpsStatsVisible = (value) => {
  return {
    type: 'SET_IS_FPS_STATS_VISIBLE',
    value
  }
}

export const setIsNetworkStatsVisible = (value) => {
  return {
    type: 'SET_IS_NETWORK_STATS_VISIBLE',
    value
  }
}

export const setEntityInterpolationType = (value) => {
  return {
    type: 'SET_ENTITY_INTERPOLATION_TYPE',
    value
  }
}
