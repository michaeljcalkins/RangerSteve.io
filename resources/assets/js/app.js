import { createStore, compose } from 'redux'
import storage from 'store'

import reducers from './reducers'
import Check from './lib/Check'
import ui from './ui'
import game from './game'

if (storage.get('banned') === true) {
    window.location = '/'
}

const store = createStore(reducers, {}, compose(
    window.devToolsExtension && window.devToolsExtension()
))

window.check = Check
ui(store)
game(store)
