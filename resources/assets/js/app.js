import { createStore } from 'redux'

import rootReducer from './reducers'
import Check from './lib/Check'
import ui from './ui'
import game from './game'

window.check = Check
window.socket = io.connect()

const store = createStore(rootReducer)

ui(store)
game(store)
