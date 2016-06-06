import { combineReducers } from 'redux'

import player from './player'
import room from './room'

const App = combineReducers({
    player,
    room
})

export default App
