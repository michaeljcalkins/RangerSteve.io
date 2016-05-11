require('babel-register')({
    plugins: ['babel-plugin-rewire']
})
var jsdom = require('jsdom').jsdom
var exposedProperties = ['window', 'navigator', 'document', 'Waveform']

global._ = require('lodash')
global.Phaser = {}
global.document = jsdom('')
global.window = document.defaultView
global.csrf_token = 'token'
// Customs globals for Musicbed
global.Waveform = function() {}

Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property)
        global[property] = document.defaultView[property]
    }
})

global.navigator = {
    userAgent: 'node.js'
}

documentRef = document
