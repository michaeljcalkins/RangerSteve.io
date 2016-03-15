'use strict'

let ForestCtf = require('./maps/ForestCtf')
let Weapons = require('./lib/Weapons')
let InputHandler = require('./lib/InputHandler')
// let EnemyBuffalo = require('./lib/EnemyBuffalo')
let SocketEvents = require('./socketEvents')
let Core = require('./core')

let gameWidth = window.innerWidth
let gameHeight = window.innerHeight
let worldWidth = 4000
let worldHeight = 1500

let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game')

let RangerSteveGame = function() {
    this.currentWeapon = 0
    this.enemies = []
    this.game = game
    this.ground
    this.platforms
    this.player
    this.score = 0
    this.scoreText
    this.socket
    this.weaponName = null
    this.weapons = []
}

RangerSteveGame.prototype = {
    init: Core.init,

    preload: function() {
        this.load.image('treescape', '/images/map-ctf1.png')
        this.load.image('ground', '/images/platform.png')
        this.load.image('bullet12', '/images/bullet12.png')

        this.load.spritesheet('dude', '/images/dude.png', 32, 48)
        this.load.spritesheet('enemy', '/images/dude.png', 32, 48)

        this.load.audio('AK47-sound', '/audio/AK47.ogg')
        this.load.audio('BarretM82A1-sound', '/audio/BarretM82A1.ogg')
    },

    create: function() {
        this.socket = io.connect()
        this.enemies = []

        //  We're going to be using physics, so enable the Arcade Physics system
        this.physics.startSystem(Phaser.Physics.ARCADE)

        this.world.setBounds(0, 0, worldWidth, worldHeight)
        this.game.stage.backgroundColor = "#2F91D0"

        // Scale game on window resize
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
        this.game.scale.setShowAll()
        this.game.scale.refresh()


        /**
         * Map
         */
        ForestCtf.create(this)

        // Define movement constants
        this.MAX_SPEED = 400 // pixels/second
        this.ACCELERATION = 1960 // pixels/second/second
        this.DRAG = 1500 // pixels/second
        this.GRAVITY = 1900 // pixels/second/second
        this.JUMP_SPEED = -850 // pixels/second (negative y is up)


        /**
         * Player Settings
         */
        this.player = this.add.sprite(400, this.world.height - 400, 'dude')

        //  We need to enable physics on the player
        this.physics.arcade.enable(this.player)

        // Enable physics on the player
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE)

        // Make player collide with world boundaries so he doesn't leave the stage
        this.player.body.collideWorldBounds = true

        // Set player minimum and maximum movement speed
        this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10) // x, y

        // Add drag to the player that slows them down when they are not accelerating
        this.player.body.drag.setTo(this.DRAG, 0) // x, y

        // Since we're jumping we need gravity
        game.physics.arcade.gravity.y = this.GRAVITY

        // Flag to track if the jump button is pressed
        this.jumping = false

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true)
        this.player.animations.add('right', [5, 6, 7, 8], 10, true)

        this.player.meta = {
            health: 100
        }


        /**
         * Enemy Settings
         */
        // EnemyBuffalo.call(this)


        /**
         * Weapons
         */
        this.currentWeapon = 0
        this.weapons.push(new Weapons.AK47(this.game))
        this.weapons.push(new Weapons.BarretM82A1(this.game))


        /**
         * Text
         */
        let textStyles = { fontSize: '24px', fill: '#000' }
        this.scoreText = this.add.text(25, 25, 'Score: 0', textStyles)
        this.scoreText.fixedToCamera = true
        this.weaponName = this.add.text(this.camera.width - 100, this.camera.height - 45, 'AK-47', textStyles)
        this.weaponName.fixedToCamera = true
        this.healthText = this.add.text(this.camera.x + 25, this.camera.height - 45, this.player.meta.health, textStyles)
        this.healthText.fixedToCamera = true


        /**
         * Camera Settings
         */
        this.camera.follow(this.player)

        let changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        changeKey.onDown.add(this.nextWeapon, this)


        /**
         * Resizing Events
         */
        window.addEventListener('resize', () => {
            this.game.scale.refresh()
            this.game.height = window.innerHeight
            this.game.width = window.innerWidth

            this.weaponName.cameraOffset.x = this.camera.width - 100
            this.weaponName.cameraOffset.y = this.camera.height - 45

            this.scoreText.cameraOffset.x = 25
            this.scoreText.cameraOffset.y = 25
        })


        /**
         * Start listening for events
         */
        this.setEventHandlers()
    },

    update: function() {
        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms, null, null, this)
        // this.physics.arcade.collide(this.enemyBuffalo, this.platforms)

        this.physics.arcade.collide(this.platforms, this.weapons, function(platform, weapon) {
            weapon.kill()
        }, null, this)

        this.enemies.forEach((enemy) => {
            this.physics.arcade.collide(enemy.player, this.platforms, null, null, this)
            this.physics.arcade.collide(enemy.player, this.weapons, function(enemyPlayer, weapon) {
                weapon.kill()


                return false
            }, null, this)

        })

        // this.physics.arcade.collide(this.enemyBuffalo, this.weapons,  null, function(enemyBuffalo, weapon) {
        //     weapon.kill()
        //     enemyBuffalo.meta.health -= weapon.damage
        //
        //     if (enemyBuffalo.meta.health <= 0) {
        //         enemyBuffalo.meta.health = 100
        //         enemyBuffalo.x = 200
        //         enemyBuffalo.y = this.world.height - 400
        //     }
        //
        //     return false
        // }, this)

        // this.physics.arcade.collide(this.enemyBuffalo, this.player,  null, function(enemyBuffalo, player) {
        //     if (enemyBuffalo.meta.reloading)
        //         return false
        //
        //     player.meta.health -= enemyBuffalo.meta.damage
        //     this.healthText.text = player.meta.health
        //     enemyBuffalo.meta.reloading = true
        //
        //     setTimeout(function() {
        //         enemyBuffalo.meta.reloading = false
        //     }, enemyBuffalo.meta.reloadTime)
        //
        //     if (player.meta.health <= 0) {
        //         player.meta.health = 100
        //         player.x = 200
        //         player.y = this.world.height - 400
        //         this.healthText.text = player.meta.health
        //     }
        //
        //     return false
        // }, this)

        // if (this.enemyBuffalo.x < this.player.x) {
        //     this.enemyBuffalo.body.acceleration.x = this.ACCELERATION
        // }
        //
        // if (this.enemyBuffalo.x > this.player.x) {
        //     this.enemyBuffalo.body.acceleration.x = -this.ACCELERATION
        // }

        if (this.leftInputIsActive()) {
            // If the LEFT key is down, set the player velocity to move left
            this.player.body.acceleration.x = -this.ACCELERATION
            this.player.animations.play('left')
        } else if (this.rightInputIsActive()) {
            // If the RIGHT key is down, set the player velocity to move right
            this.player.body.acceleration.x = this.ACCELERATION
            this.player.animations.play('right')
        } else {
            // Stand still
            this.player.body.acceleration.x = 0
            this.player.animations.stop()
            this.player.frame = 4
        }

        // Set a variable that is true when the player is touching the ground
        let onTheGround = this.player.body.touching.down

        // If the player is touching the ground, let him have 2 jumps
        if (onTheGround) {
            this.jumps = 2
            this.jumping = false
        }

        // Jump!
        if (this.jumps > 0 && this.upInputIsActive(5)) {
            this.player.body.velocity.y = this.JUMP_SPEED
            this.jumping = true
        }

        // Reduce the number of available jumps if the jump input is released
        if (this.jumping && this.upInputReleased()) {
            this.jumps--
            this.jumping = false
        }

        if (this.game.input.activePointer.isDown)
        {
            this.weapons[this.currentWeapon].fire(this.player)
        }

        this.socket.emit('move player', { x: this.player.x, y: this.player.y })
    },

    leftInputIsActive: InputHandler.leftInputIsActive,
    rightInputIsActive: InputHandler.rightInputIsActive,
    upInputIsActive: InputHandler.upInputIsActive,
    upInputReleased: InputHandler.upInputReleased,

    nextWeapon: function() {
        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset()
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0)
            this.weapons[this.currentWeapon].setAll('exists', false)
        }

        //  Activate the new one
        this.currentWeapon++

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0
        }

        this.weapons[this.currentWeapon].visible = true

        this.weaponName.text = this.weapons[this.currentWeapon].name
    },

    setEventHandlers: function () {
        // Socket connection successful
        this.socket.on('connect', this.onSocketConnected.bind(this))

        // Socket disconnection
        this.socket.on('disconnect', this.onSocketDisconnect.bind(this))

        // Player move message received
        this.socket.on('move player', this.onMovePlayer.bind(this))

        // Player removed message received
        this.socket.on('remove player', this.onRemovePlayer.bind(this))

        // Updated list of players to sync enemies to
        this.socket.on('update players', this.onUpdatePlayers.bind(this))
    },

    onUpdatePlayers: SocketEvents.onUpdatePlayers,
    onSocketConnected: SocketEvents.onSocketConnected,
    onSocketDisconnect: SocketEvents.onSocketDisconnect,
    onMovePlayer: SocketEvents.onMovePlayer,
    onRemovePlayer: SocketEvents.onRemovePlayer
}

game.state.add('Game', RangerSteveGame, true)
