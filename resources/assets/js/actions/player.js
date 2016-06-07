export const setCurrentWeapon = (value) => {
    return {
        type: 'SET_CURRENT_WEAPON',
        value
    }
}

export const setHealth = (value) => {
    return {
        type: 'SET_HEALTH',
        value
    }
}

export const setNickname = (value) => {
    return {
        type: 'SET_NICKNAME',
        value
    }
}

export const setScore = (value) => {
    return {
        type: 'SET_SCORE',
        value
    }
}

export const setJumping = (value) => {
    return {
        type: 'SET_JUMPING',
        value
    }
}

export const setJumps = (value) => {
    return {
        type: 'SET_JUMPS',
        value
    }
}

export const decrementJumpJetCounter = (value) => {
    return {
        type: 'DECREMENT_JUMP_JET_COUNTER',
        value
    }
}

export const incrementJumpJetCounter = (value) => {
    return {
        type: 'INCREMENT_JUMP_JET_COUNTER',
        value
    }
}

export const setJumpJetCounter = (value) => {
    return {
        type: 'SET_JUMP_JET_COUNTER',
        value
    }
}

export const incrementJumps = (value) => {
    return {
        type: 'INCREMENT_JUMPS',
        value
    }
}

export const decrementJumps = (value) => {
    return {
        type: 'DECREMENT_JUMPS',
        value
    }
}
