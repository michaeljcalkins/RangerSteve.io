function check(object, propTypes, _throw) {
    let propName;

    for (propName in propTypes) {
        if (propTypes.hasOwnProperty(propName)) {
            let error = propTypes[propName](object, propName, JSON.stringify(object), 'prop');
            if (error) {
                if (_throw) {
                    throw error
                } else {
                    console.error(error.message)
                }
                return false
            }
        }
    }

    return true
}
window.check = check

import ui from './ui'
import game from './game'

ui()
game()
