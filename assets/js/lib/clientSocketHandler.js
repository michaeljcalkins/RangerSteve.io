'use strict'

let _ = require('lodash')
let remotePlayer = require('./remotePlayer')

module.exports = {
    setEventHandlers: function () {
        // Socket connection successful
        this.socket.on('connect', this.onSocketConnected.bind(this))

        // Socket disconnection
        this.socket.on('disconnect', this.onSocketDisconnect.bind(this))

        // New player message received
        this.socket.on('new player', this.onNewPlayer.bind(this))

        // Player move message received
        this.socket.on('move player', this.onMovePlayer.bind(this))

        // Player removed message received
        this.socket.on('remove player', this.onRemovePlayer.bind(this))

        // A player has died
        this.socket.on('dead player', this.onDeadPlayer.bind(this))
    },

    // Socket connected
    onSocketConnected: function() {
        console.log('Connected to socket server')

         // Reset enemies on reconnect
        this.enemies.forEach(function (enemy) {
            enemy.player.kill()
        })
        this.enemies = []

        // Send local player data to the game server
        this.socket.emit('new player', {
            clientId: this.clientId,
            x: this.player.x,
            y: this.player.y
        })
    },

    // Socket disconnected
    onSocketDisconnect: function() {
        console.log('Disconnected from socket server')
    },

    // New player
    onNewPlayer: function(data) {
        console.log('New player connected:', data.id)

        // Avoid possible duplicate players
        var duplicate = _.findWhere(this.enemies, { id: data.id })
        if (duplicate || data.clientId === this.clientId) {
            console.log('Duplicate player!')
            return
        }

        let newRemotePlayer = remotePlayer.create.call(this, {
            x: data.x,
            y: data.y,
            id: data.id
        })

        this.enemies.push(newRemotePlayer)
    },

    onDeadPlayer: function(data) {
        console.log('YOU DIED!!!')

        if (data.deadPlayerId !== this.player.id)
            return

        this.player.x = 200
        this.player.y = this.world.height - 400
    },

    // Move player
    onMovePlayer: function(data) {
        var movePlayer = _.findWhere(this.enemies, { id: data.id })

        // Player not found
        if (! movePlayer) {
            return
        }

        // Update player position
        movePlayer.x = data.x
        movePlayer.y = data.y

        if (movePlayer.x > movePlayer.lastPosition.x) {
            movePlayer.animations.play('right')
        }
        else if (movePlayer.x < movePlayer.lastPosition.x)
        {
            movePlayer.animations.play('left')
        }
        else
        {
            movePlayer.animations.stop()
            movePlayer.frame = 4;
        }

        movePlayer.lastPosition.x = movePlayer.x
        movePlayer.lastPosition.y = movePlayer.y
    },

    // Remove player
    onRemovePlayer: function(data) {
        var removePlayer = _.findWhere(this.enemies, { id: data.id })

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.id)
            return
        }

        removePlayer.kill()

        // Remove player from array
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1)
    }
}
