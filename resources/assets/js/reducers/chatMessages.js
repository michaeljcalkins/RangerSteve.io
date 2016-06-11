const initialState = {
    messages: []
}

const chatMessages = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages : [
                    ...state.messages,
                    action.value
                ]
            }

        default:
            return state
    }
}

export default chatMessages
