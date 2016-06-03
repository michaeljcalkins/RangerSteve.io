import Check from './lib/Check'
import ui from './ui'
import game from './game'
import store from 'store'

if (store.get('banned') === true) {
    window.location = 'https://www.google.com'
}

window.check = Check
ui()
game()
