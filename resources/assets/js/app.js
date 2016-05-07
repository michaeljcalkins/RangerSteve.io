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
            }
        }
    }
}
window.check = check

require('./ui')
require('./game')
