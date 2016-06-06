export const setCurrentWeapon = (value) => {
    return {
        type: 'SET_CURRENT_WEAPON',
        value
    }
}

export const setHealth = (value) => {
    return {
        type: 'SET_PLAYER',
        value
    }
}

export const setScore = (value) => {
    return {
        type: 'SET_SCORE',
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
