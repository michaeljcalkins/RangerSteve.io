toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: 'toast-top-center',
    preventDuplicates: false,
    onclick: null,
    showDuration: 300,
    hideDuration: 1000,
    timeOut: 3000,
    extendedTimeOut: 1000,
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
}

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
