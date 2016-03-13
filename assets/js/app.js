'use strict'

var MapCtf1 = require('./maps/MapCtf1')
var RemotePlayer = require('./lib/RemotePlayer')
var Guid = require('./lib/Guid')
let Weapons = require('./lib/Weapons')

var gameWidth = window.innerWidth
var gameHeight = window.innerHeight
var worldWidth = 4000
var worldHeight = 1500

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'ranger-steve-game');

var RangerSteveGame = function() {
    this.clientId = Guid()
    this.currentWeapon = 0;
    this.enemies = []
    this.game = game
    this.ground
    this.platforms
    this.player
    this.score = 0
    this.scoreText
    this.socket
    this.weaponName = null;
    this.weapons = [];
}

RangerSteveGame.prototype = {
    init: function() {
        this.game.renderer.renderSession.roundPixels = true
        this.game.stage.disableVisibilityChange = true
        this.physics.startSystem(Phaser.Physics.ARCADE)
    },

    preload: function() {
        this.load.image('bullet11', '/images/bullet11.png')
        this.load.image('bullet10', '/images/bullet10.png')
        this.load.image('bullet9', '/images/bullet9.png')
        this.load.image('bullet8', '/images/bullet8.png')
        this.load.image('bullet7', '/images/bullet7.png')
        this.load.image('bullet5', '/images/bullet5.png')
        this.load.image('bullet4', '/images/bullet4.png')
        this.load.image('treescape', '/images/map-ctf1.png')
        this.load.image('ground', '/images/platform.png')
        this.load.spritesheet('dude', '/images/dude.png', 32, 48)
        this.load.spritesheet('enemy', '/images/dude.png', 32, 48)
    },

    create: function() {
        this.socket = io.connect()
        this.enemies = []

        //  We're going to be using physics, so enable the Arcade Physics system
        this.physics.startSystem(Phaser.Physics.ARCADE)

        this.world.setBounds(0, 0, worldWidth, worldHeight)
        this.game.stage.backgroundColor = "#2F91D0"

        // Scale game on window resize
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.game.scale.setShowAll();
        this.game.scale.refresh()


        /**
         * Map
         */
        MapCtf1.create(this)

        // Define movement constants
        this.MAX_SPEED = 400; // pixels/second
        this.ACCELERATION = 1960; // pixels/second/second
        this.DRAG = 1500; // pixels/second
        this.GRAVITY = 1900; // pixels/second/second
        this.JUMP_SPEED = -850; // pixels/second (negative y is up)


        /**
         * Player Settings
         */
        this.player = this.add.sprite(200, this.world.height - 400, 'dude');

        //  We need to enable physics on the player
        this.physics.arcade.enable(this.player);

        // Enable physics on the player
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

        // Make player collide with world boundaries so he doesn't leave the stage
        this.player.body.collideWorldBounds = true;

        // Set player minimum and maximum movement speed
        this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

        // Add drag to the player that slows them down when they are not accelerating
        this.player.body.drag.setTo(this.DRAG, 0); // x, y

        // Since we're jumping we need gravity
        game.physics.arcade.gravity.y = this.GRAVITY;

        // Flag to track if the jump button is pressed
        this.jumping = false;

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true)
        this.player.animations.add('right', [5, 6, 7, 8], 10, true)


        /**
         * Weapons
         */
        this.currentWeapon = 0;
        this.weapons.push(new Weapons.AK47(this.game));
        this.weapons.push(new Weapons.BarretM82A1(this.game));


        /**
         * Text
         */
        let textStyles = { fontSize: '24px', fill: '#000' }
        this.scoreText = this.add.text(25, 25, 'Score: 0', textStyles)
        this.scoreText.fixedToCamera = true
        this.weaponName = this.add.text(this.camera.width - 100, this.camera.height - 45, 'AK-47', textStyles)
        this.weaponName.fixedToCamera = true
        this.currentHealthText = this.add.text(this.camera.x + 25, this.camera.height - 45, '100', textStyles)
        this.currentHealthText.fixedToCamera = true


        /**
         * Camera Settings
         */
        this.camera.follow(this.player);

        var changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
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
        this.physics.arcade.collide(this.player, this.platforms)
        this.physics.arcade.collide(this.platforms, this.weapons, function(platform, weapon) {
            weapon.kill()
        }, null, this);

        this.physics.arcade.collide(this.enemy, this.weapons, function(enemy, weapon) {
            enemy.health -= weapon.damage
            weapon.kill()
            console.log('You hit them!', enemy.health, weapon.damage)
            if (enemy.health <= 0) {
                console.log('They are dead!')
                this.enemy.x = 200
                this.enemy.y = 200
                this.enemy.health = 100
            }
        }, null, this);

        if (this.leftInputIsActive()) {
            // If the LEFT key is down, set the player velocity to move left
            this.player.body.acceleration.x = -this.ACCELERATION;
            this.player.animations.play('left')
        } else if (this.rightInputIsActive()) {
            // If the RIGHT key is down, set the player velocity to move right
            this.player.body.acceleration.x = this.ACCELERATION;
            this.player.animations.play('right')
        } else {
            // Stand still
            this.player.body.acceleration.x = 0
            this.player.animations.stop()
            this.player.frame = 4
        }

        // Set a variable that is true when the player is touching the ground
        var onTheGround = this.player.body.touching.down;

        // If the player is touching the ground, let him have 2 jumps
        if (onTheGround) {
            this.jumps = 2;
            this.jumping = false;
        }

        // Jump!
        if (this.jumps > 0 && this.upInputIsActive(5)) {
            this.player.body.velocity.y = this.JUMP_SPEED;
            this.jumping = true;
        }

        // Reduce the number of available jumps if the jump input is released
        if (this.jumping && this.upInputReleased()) {
            this.jumps--;
            this.jumping = false;
        }

        if (this.game.input.activePointer.isDown)
        {
            this.weapons[this.currentWeapon].fire(this.player);
        }

        this.socket.emit('move player', { x: this.player.x, y: this.player.y })
    },

    // This function should return true when the player activates the "go left" control
    // In this case, either holding the right arrow or tapping or clicking on the left
    // side of the screen.
    leftInputIsActive: function() {
        var isActive = false;

        isActive = this.input.keyboard.isDown(Phaser.Keyboard.A);

        return isActive;
    },

    // This function should return true when the player activates the "go right" control
    // In this case, either holding the right arrow or tapping or clicking on the right
    // side of the screen.
    rightInputIsActive: function() {
        var isActive = false;

        isActive = this.input.keyboard.isDown(Phaser.Keyboard.D);

        return isActive;
    },

    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    upInputIsActive: function(duration) {
        var isActive = false;

        isActive = this.input.keyboard.downDuration(Phaser.Keyboard.W, duration);

        return isActive;
    },

    // This function returns true when the player releases the "jump" control
    upInputReleased: function() {
        var released = false;

        released = this.input.keyboard.upDuration(Phaser.Keyboard.W);

        return released;
    },

    nextWeapon: function() {
        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset();
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false;
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
            this.weapons[this.currentWeapon].setAll('exists', false);
        }

        //  Activate the new one
        this.currentWeapon++;

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0;
        }

        this.weapons[this.currentWeapon].visible = true;

        this.weaponName.text = this.weapons[this.currentWeapon].name;
    },

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
    },

    // Socket connected
    onSocketConnected: function(data) {
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
        var duplicate = this.playerById(data.id)
        if (duplicate || data.clientId === this.clientId) {
            console.log('Duplicate player!')
            return
        }

        // Add new player to the remote players array
        let newRemotePlayer = RemotePlayer.create(data.id, this.game, this.player, data.x, data.y)
        this.enemies.push(newRemotePlayer)
        this.enemies[this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true)
        this.enemies[this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true)
    },

    // Move player
    onMovePlayer: function(data) {
        var movePlayer = this.playerById(data.id)

        // Player not found
        if (! movePlayer) {
            return
        }

        // Update player position
        movePlayer.player.x = data.x
        movePlayer.player.y = data.y

        if (movePlayer.player.x > movePlayer.lastPosition.x) {
            movePlayer.player.animations.play('right')
        }
        else if (movePlayer.player.x < movePlayer.lastPosition.x)
        {
            movePlayer.player.animations.play('left')
        }
        else
        {
            movePlayer.player.animations.stop()
            movePlayer.player.frame = 4;
        }

        movePlayer.lastPosition.x = movePlayer.player.x
        movePlayer.lastPosition.y = movePlayer.player.y
    },

    // Remove player
    onRemovePlayer: function(data) {
        var removePlayer = this.playerById(data.id)

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.id)
            return
        }

        removePlayer.player.kill()

        // Remove player from array
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1)
    },

    // Find player by ID
    playerById: function(id) {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].player.name === id) {
                return this.enemies[i]
            }
        }

        return false
    }
}

game.state.add('Game', RangerSteveGame, true);
