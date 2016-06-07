import storage from 'store'
import NameGenerator from '../lib/NameGenerator'

const initialState = {
    currentWeapon: 'primaryWeapon',
    health: 100,
    nickname: storage.get('nickname', NameGenerator()),
    score: 0,
    selectedSecondaryWeaponId: '',
    selectedPrimaryWeaponId: '',
    jumpJetCounter: 0,
    jumps: 2,
    jumping: false,
    selectedPrimaryWeapon: storage.get('selectedPrimaryWeapon', 'AK47'),
    selectedSecondaryWeapon: storage.get('selectedSecondaryWeapon', 'DesertEagle'),
    facing: 'left'
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

        case 'DECREMENT_JUMPS':
            return {
                ...state,
                jumps: state.jumps--
            }

        case 'INCREMENT_JUMPS':
            return {
                ...state,
                jumps: state.jumps++
            }

        case 'SET_FACING':
            return {
                ...state,
                facing: action.value
            }

        default:
            return state
    }
}

export default player
