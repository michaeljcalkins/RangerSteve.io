import { combineReducers } from 'redux'

import player from './player'
import room from './room'
import game from './game'

const App = combineReducers({
    player,
    room,
    game
})

export default App
