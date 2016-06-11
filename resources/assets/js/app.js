import { createStore, compose } from 'redux'
import storage from 'store'

import reducers from './reducers'
import Check from './lib/Check'
import ui from './ui'
import game from './game'

if (storage.get('banned') === true) {
    window.location = '/'
}

window.check = Check

const store = createStore(reducers, {}, compose(
    // window.devToolsExtension && window.devToolsExtension()
))

window.socket = io.connect()

ui(store)
game(store)
