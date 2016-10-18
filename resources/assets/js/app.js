import { createStore } from 'redux'

import rootReducer from './reducers'
import ui from './ui'
import game from './game'

window.socket = io.connect()

const store = createStore(rootReducer)

// ui(store)
game(store)
