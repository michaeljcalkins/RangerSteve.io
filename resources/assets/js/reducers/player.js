import storage from 'store'
import NameGenerator from '../lib/NameGenerator'

const initialState = {
    currentWeapon: 'primaryWeapon',
    health: 100,
    nickname: storage.get('nickname', NameGenerator()),
    score: 0,
    selectedSecondaryWeaponId: '',
    selectedPrimaryWeaponId: '',
    sfxVolume: .2,
    musicVolume: .2,
    jumpJetCounter: 0,
    chatModalIsOpen: false,
    settingsModalIsOpen: false,
    jumps: 2,
    jumping: false
}

const player = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_CURRENT_WEAPON':
            return {
                ...state,
                currentWeapon: action.value
            }

        case 'SET_HEALTH':
            return {
                ...state,
                health: action.value
            }

        case 'SET_SCORE':
            return {
                ...state,
                score: action.value
            }

        case 'SET_NICKNAME':
            return {
                ...state,
                nickname: action.value
            }

        case 'OPEN_CHAT_MODAL':
            return {
                ...state,
                chatModalIsOpen: action.value
            }

        case 'CLOSE_CHAT_MODAL':
            return {
                ...state,
                chatModalIsOpen: action.value
            }

        case 'OPEN_SETTINGS_MODAL':
            return {
                ...state,
                settingsModalIsOpen: action.value
            }

        case 'CLOSE_SETTINGS_MODAL':
            return {
                ...state,
                settingsModalIsOpen: action.value
            }

        case 'SET_JUMP_JET_COUNTER':
            return {
                ...state,
                jumpJetCounter: action.value
            }

        case 'DECREMENT_JUMP_JET_COUNTER':
            return {
                ...state,
                jumpJetCounter: state.jumpJetCounter - action.value
            }

        case 'INCREMENT_JUMP_JET_COUNTER':
            return {
                ...state,
                jumpJetCounter: state.jumpJetCounter + action.value
            }

        case 'SET_JUMPING':
            return {
                ...state,
                jumping: action.value
            }

        case 'SET_JUMPS':
            return {
                ...state,
                jumps: action.value
            }

        default:
            return state
    }
}

export default player
