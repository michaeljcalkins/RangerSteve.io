import { createStore } from 'redux'

import reducers from './reducers'
import Check from './lib/Check'
import ui from './ui'
import game from './game'
import storage from 'store'

if (storage.get('banned') === true) {
    window.location = 'https://www.google.com'
}

let store = createStore(reducers)

window.check = Check
ui(store)
game(store)
