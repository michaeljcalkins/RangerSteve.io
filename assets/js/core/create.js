'use strict'

let ForestCtf = require('../maps/ForestCtf')
let Weapons = require('../lib/Weapons')

let worldWidth = 4000
let worldHeight = 1500

module.exports = function() {
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
    ForestCtf.create.call(this)

    // Define movement constants
    this.MAX_SPEED = 400 // pixels/second
    this.ACCELERATION = 1960 // pixels/second/second
    this.DRAG = 1500 // pixels/second
    this.GRAVITY = 1900 // pixels/second/second
    this.JUMP_SPEED = -850 // pixels/second (negative y is up)


    /**
     * Player Settings
     */
    let spawnPoint = ForestCtf.getRandomSpawnPoint.call(this)
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'dude')

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
    this.game.physics.arcade.gravity.y = this.GRAVITY

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
    this.weapons = [
        new Weapons.AK47({
            game: this.game
        }),
        new Weapons.BarretM82A1({
            game: this.game
        })
    ]


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
     * Enemy Bullets
     */
    this.enemyBullets = this.game.add.group()


    /**
     * Start listening for events
     */
    this.setEventHandlers()
}
