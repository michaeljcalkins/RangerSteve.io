import { createStore } from 'redux'
import storage from 'store'

import getParameterByName from './lib/GetParameterByName.js'
import rootReducer from './reducers'
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
window.socket = io.connect()

const store = createStore(rootReducer)

ui(store)
game(store)

/**
 * If the user has this game in the background websockets
 * stop listening for events.  Check for the current
 * state of the game until the game is loaded.
 */
let gameLoader = null
gameLoader = setInterval(() => {
    if (store.getState().game.state === 'loading') {
        window.socket.emit('new player', {
            roomId: getParameterByName('roomId'),
            map: getParameterByName('map'),
            x: 0,
            y: 0,
            weaponId: store.getState().player.currentWeapon === 'primaryWeapon' ? store.getState().player.selectedPrimaryWeaponId : store.getState().player.selectedSecondaryWeaponId,
            nickname: store.getState().player.nickname
        })
        return
    }

    clearInterval(gameLoader)
}, 2000)
