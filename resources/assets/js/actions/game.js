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

export const setMusicVolume = (value) => {
    return {
        type: 'SET_MUSIC_VOLUME',
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

export const setState = (value) => {
    return {
        type: 'SET_STATE',
        value
    }
}
