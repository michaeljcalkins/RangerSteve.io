import storage from 'store'
import GameConsts from 'lib/GameConsts'

const initialState = {
  chatModalIsOpen: false,
  killingSpreeCount: 0,
  killLogMessages: [],
  chatMessages: [],
  keyboardControls: {
    left: storage.get('keyboardControl.left', window.Phaser.Keyboard.A),
    right: storage.get('keyboardControl.right', window.Phaser.Keyboard.D),
    up: storage.get('keyboardControl.up', window.Phaser.Keyboard.W),
    switchWeapon: storage.get('keyboardControl.switchWeapon', window.Phaser.Keyboard.Q),
    newChatMessage: storage.get('keyboardControl.newChatMessage', window.Phaser.Keyboard.T),
    reload: storage.get('keyboardControl.reload', window.Phaser.Keyboard.R),
    fly: storage.get('keyboardControl.fly', window.Phaser.Keyboard.SHIFT),
    selfkill: storage.get('keyboardControl.selfkill', window.Phaser.Keyboard.TILDE)
  },
  settingsModalIsOpen: !storage.has('nickname'),
  leaderboardModalIsOpen: false,
  settingsView: 'default',
  sfxVolume: storage.get('sfxVolume', GameConsts.STARTING_SFX_VOLUME),
  showKillConfirmed: false,
  state: 'active',
  resetEventsFlag: false,
  autoRespawn: storage.get('autoRespawn', false),
  isFpsStatsVisible: storage.get('isFpsStatsVisible', false),
  isNetworkStatsVisible: storage.get('isNetworkStatsVisible', false),
  useWebgl: storage.get('useWebgl', GameConsts.USE_WEBGL_BY_DEFAULT)
}

const player = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_LEADERBOARD_MODAL':
      return {
        ...state,
        leaderboardModalIsOpen: action.value
      }

    case 'CLOSE_LEADERBOARD_MODAL':
      return {
        ...state,
        leaderboardModalIsOpen: action.value
      }

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

    case 'SET_CHAT_MESSAGES':
      return {
        ...state,
        chatMessages: action.value
      }

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          action.value
        ].slice(-5)
      }

    case 'REMOVE_CHAT_MESSAGE':
      const chatMessageIndex = state.chatMessages.indexOf(action.value)
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages.slice(0, chatMessageIndex),
          ...state.chatMessages.slice(chatMessageIndex + 1)
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
      const killLogIndex = state.killLogMessages.indexOf(action.value)
      return {
        ...state,
        killLogMessages: [
          ...state.killLogMessages.slice(0, killLogIndex),
          ...state.killLogMessages.slice(killLogIndex + 1)
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

    case 'SET_SFX_VOLUME':
      return {
        ...state,
        sfxVolume: action.value
      }

    case 'SET_AUTO_RESPAWN':
      return {
        ...state,
        autoRespawn: action.value
      }

    case 'SET_IS_NETWORK_STATS_VISIBLE':
      return {
        ...state,
        isNetworkStatsVisible: action.value
      }

    case 'SET_IS_FPS_STATS_VISIBLE':
      return {
        ...state,
        isFpsStatsVisible: action.value
      }

    default:
      return state
  }
}

export default player
