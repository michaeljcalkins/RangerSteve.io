var util = require('util')

var onClientDisconnect = require('./socketActions/onClientDisconnect')
var onNewPlayer = require('./socketActions/onNewPlayer')
var onMovePlayer = require('./socketActions/onMovePlayer')
var onDamagedPlayer = require('./socketActions/onDamagedPlayer')

module.exports = function(ioInstance) {
    this.players = []
    this.io = ioInstance
    this.socket = null

    setEventHandlers.bind(this)
}

function setEventHandlers() {
    // Socket.IO
    this.io.on('connection', onSocketConnection.bind(this))
}

// New socket connection
function onSocketConnection(socket) {
    this.socket = socket
    util.log('New player has connected: ' + this.socket.id)

    // Listen for client disconnected
    this.socket.on('disconnect', onClientDisconnect.bind(this))

    // Listen for new player message
    this.socket.on('new player', onNewPlayer.bind(this))

    // Listen for move player message
    this.socket.on('move player', onMovePlayer.bind(this))

    // Listen for damage from one player to another
    this.socket.on('damaged player', onDamagedPlayer.bind(this))
}
