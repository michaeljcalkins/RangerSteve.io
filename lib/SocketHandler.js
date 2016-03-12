var console = require('console')

var onClientDisconnect = require('./socketActions/onClientDisconnect')
var onNewPlayer = require('./socketActions/onNewPlayer')
var onMovePlayer = require('./socketActions/onMovePlayer')
var onDamagedPlayer = require('./socketActions/onDamagedPlayer')

module.exports = function(ioInstance) {
    this.players = []
    this.io = ioInstance
    this.client = null

    setEventHandlers.call(this)
}

function setEventHandlers() {
    console.log('Socket listeners started.')
    // Socket.IO
    this.io.on('connection', onSocketConnection.bind(this))
}

// New socket connection
function onSocketConnection(client) {
    this.client = client
    console.log('New player has connected: ' + this.client.id)

    // Listen for client disconnected
    this.client.on('disconnect', onClientDisconnect.bind(this))

    // Listen for new player message
    this.client.on('new player', onNewPlayer.bind(this))

    // Listen for move player message
    this.client.on('move player', onMovePlayer.bind(this))

    // Listen for damage from one player to another
    // this.client.on('damaged player', onDamagedPlayer.bind(this))
}
