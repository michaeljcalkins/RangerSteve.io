import storage from 'store'
import GameConsts from '../lib/GameConsts'

const initialState = {
    chatModalIsOpen: false,
    killingSpreeCount: 0,
    killLogMessages: [],
    messages: [],
    musicVolume: storage.get('musicVolume', GameConsts.STARTING_MUSIC_VOLUME),
    settingsModalIsOpen: !storage.has('nickname'),
    settingsView: 'main',
    sfxVolume: storage.get('sfxVolume', GameConsts.STARTING_SFX_VOLUME),
    showKillConfirmed: false
}

const player = (state = initialState, action) => {
    switch (action.type) {
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

        case 'SET_SHOW_KILL_CONFIRMED':
            return {
                ...state,
                showKillConfirmed: action.value
            }

        case 'SET_SETTINGS_MODAL_VIEW':
            return {
                ...state,
                settingsView: action.value
            }

        case 'SET_MUSIC_VOLUME':
            return {
                ...state,
                musicVolume: action.value
            }

        case 'SET_SFX_VOLUME':
            return {
                ...state,
                sfxVolume: action.value
            }

        case 'SET_KILLING_SPREE_COUNT':
            return {
                ...state,
                killingSpreeCount: action.value
            }

        default:
            return state
    }
}

export default player
