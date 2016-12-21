import '../sass/app.scss'
import { createStore } from 'redux'

import rootReducer from './reducers'
import ui from './ui'
import game from './game'
import checkForIframeAndRedirect from './lib/checkForIframeAndRedirect'

window.IS_ELECTRON = window && window.process && window.process.type
checkForIframeAndRedirect()
const store = createStore(rootReducer)

ui(store)
game(store)
