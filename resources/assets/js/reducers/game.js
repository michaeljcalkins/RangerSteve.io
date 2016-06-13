import storage from 'store'
import GameConsts from '../lib/GameConsts'

const initialState = {
    chatModalIsOpen: false,
    killingSpreeCount: 0,
    killLogMessages: [],
    chatMessages: [],
    keyboardControls: {
        left: storage.get('keyboardControl.left', Phaser.Keyboard.A),
        right: storage.get('keyboardControl.right', Phaser.Keyboard.D),
        up: storage.get('keyboardControl.up', Phaser.Keyboard.W),
        switchWeapon: storage.get('keyboardControl.switchWeapon', Phaser.Keyboard.Q),
        newChatMessage: storage.get('keyboardControl.newChatMessage', Phaser.Keyboard.T)
    },
    musicVolume: storage.get('musicVolume', GameConsts.STARTING_MUSIC_VOLUME),
    settingsModalIsOpen: !storage.has('nickname'),
    settingsView: 'main',
    sfxVolume: storage.get('sfxVolume', GameConsts.STARTING_SFX_VOLUME),
    showKillConfirmed: false,
    state: 'loading',
    resetEventsFlag: false
}

const player = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_RESET_EVENTS_FLAG':
            return {
                ...state,
                resetEventsFlag: action.value
            }

        case 'SET_KEYBOARD_CONTROL':
            return {
                ...state,
                keyboardControls: {
                    ...state.keyboardControls,
                    ...action.value
                }
            }

        case 'REDUCE_TO_MAX_CHAT_MESSAGES':
            return {
                ...state,
                chatMessages: state.chatMessages.slice(-5)
            }

        case 'ADD_CHAT_MESSAGE':
            return {
                ...state,
                chatMessages: [
                    ...state.chatMessages,
                    action.value
                ]
            }

        case 'REMOVE_CHAT_MESSAGE':
            var index = state.chatMessages.indexOf(action.value)
            return {
                ...state,
                chatMessages: [
                    ...state.chatMessages.slice(0, index),
                    ...state.chatMessages.slice(index + 1)
                ]
            }

        case 'ADD_KILL_LOG_MESSAGE':
            return {
                ...state,
                killLogMessages: [
                    ...state.killLogMessages,
                    action.value
                ]
            }

        case 'REMOVE_KILL_LOG_MESSAGE':
            var index = state.killLogMessages.indexOf(action.value)
            return {
                ...state,
                killLogMessages: [
                    ...state.killLogMessages.slice(0, index),
                    ...state.killLogMessages.slice(index + 1)
                ]
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

        case 'SET_STATE':
            return {
                ...state,
                state: action.value
            }

        default:
            return state
    }
}

export default player
