import storage from 'store'
import NameGenerator from '../lib/NameGenerator'

const initialState = {
    currentWeapon: 'primaryWeapon',
    health: 100,
    nickname: storage.get('nickname', NameGenerator()),
    score: 0,
    selectedSecondaryWeaponId: storage.get('selectedSecondaryWeaponId', 'DesertEagle'),
    selectedPrimaryWeaponId: storage.get('selectedPrimaryWeaponId', 'AK47'),
    jumpJetCounter: 0,
    jumps: 2,
    jumping: false,
    primaryWeapon: null,
    secondaryWeapon: null,
    facing: 'right'
}

const player = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_KILLING_SPREE_COUNT':
            return {
                ...state,
                killingSpreeCount: action.value
            }

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

        case 'SET_SELECTED_PRIMARY_WEAPON_ID':
            return {
                ...state,
                selectedPrimaryWeaponId: action.value
            }

        case 'SET_SELECTED_SECONDARY_WEAPON_ID':
            return {
                ...state,
                selectedSecondaryWeaponId: action.value
            }

        case 'SET_PRIMARY_WEAPON':
            return {
                ...state,
                primaryWeapon: action.value
            }

        case 'SET_SECONDARY_WEAPON':
            return {
                ...state,
                secondaryWeapon: action.value
            }

        case 'SET_SHOW_KILL_CONFIRMED':
            return {
                ...state,
                showKillConfirmed: action.value
            }

        default:
            return state
    }
}

export default player
