const initialState = {
    roundEndTime: 0,
}

const room = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ROOM':
            return {
                ...state,
                ...action.value,
            }

        default:
            return state
    }
}

export default room
