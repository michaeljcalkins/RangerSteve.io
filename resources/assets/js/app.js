import { createStore, compose } from 'redux'
import storage from 'store'

import reducers from './reducers'
import Check from './lib/Check'
import ui from './ui'
import game from './game'

Math.random = (function(rand) {
    var salt = 0
    document.addEventListener('mousemove', function(event) {
        salt = event.pageX * event.pageY * window.innerWidth * window.innerHeight
    })

    return function() {
        return (rand() + (1 / (1 + salt))) % 1;
    }
})(Math.random)

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
