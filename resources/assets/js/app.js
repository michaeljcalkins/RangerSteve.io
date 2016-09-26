import { createStore } from 'redux'
import moment from 'moment-timezone'

import rootReducer from './reducers'
import Check from './lib/Check'
import ui from './ui'
import game from './game'

moment.tz.setDefault('America/Los_Angeles')

window.check = Check
window.socket = io.connect()

const store = createStore(rootReducer)

ui(store)
game(store)
