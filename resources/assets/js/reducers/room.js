const initialState = {
    roundEndTime: 0,
    announcement: '',
}

const room = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ROOM':
            return {
                ...state,
                ...action.value,
            }
        case 'ADD_ANNOUNCEMENT':
            return {
                ...state,
                announcement: action.value,
            }

        default:
            return state
    }
}

export default room
