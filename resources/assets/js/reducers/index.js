import { combineReducers } from 'redux'

import player from './player'
import room from './room'
import game from './game'
import chatMessages from './chatMessages'
import killLog from './killLog'

const App = combineReducers({
    player,
    room,
    game,
    chatMessages,
    killLog
})

export default App
