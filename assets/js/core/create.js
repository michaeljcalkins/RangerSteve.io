'use strict'

let HighRuleDesert = require('../maps/HighRuleDesert')
let Weapons = require('../lib/Weapons')
import EventHandler from '../lib/EventHandler'

let worldWidth = 8000
let worldHeight = 3966

module.exports = function() {
    // Define movement constants
    this.MAX_SPEED = 400 // pixels/second
    this.ACCELERATION = 1960 // pixels/second/second
    this.DRAG = 1500 // pixels/second
    this.GRAVITY = 1900 // pixels/second/second
    this.JUMP_SPEED = -850 // pixels/second (negative y is up)

    this.socket = io.connect()
    this.enemies = []
    this.volume = .5

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
    HighRuleDesert.create.call(this)


    /**
     * Player Settings
     */
    let spawnPoint = HighRuleDesert.getRandomSpawnPoint.call(this)
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando')
    this.player.scale.setTo(.25, .25)

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
    this.player.body.setSize(300, 290, 0, -3)
    this.player.meta = {
        health: 100
    }

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY

    // Flag to track if the jump button is pressed
    this.jumping = false

    //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1, 2, 3, 4, 5], 10, true)
    this.player.animations.add('right', [8, 9, 10, 11, 12, 13], 10, true)

    this.player.meta = {
        health: 100
    }


    /**
     * Weapons
     */
    this.currentWeapon = 0
    this.weapons = [
        new Weapons.AK47({
            game: this.game
        }),
        new Weapons.M500({
            game: this.game
        }),
        new Weapons.Aug({
            game: this.game
        }),
        new Weapons.P90({
            game: this.game
        }),
        new Weapons.DesertEagle({
            game: this.game
        }),
        new Weapons.G43({
            game: this.game
        }),
        new Weapons.M4A1({
            game: this.game
        }),
        new Weapons.Barrett({
            game: this.game
        }),
        new Weapons.RPG({
            game: this.game
        }),
    ]


    /**
     * Text
     */
    let textStyles = { fontSize: '14px', fill: '#000' }

    EventHandler.emit('score update', '')
    EventHandler.emit('health update', '')
    EventHandler.on('volume update', (data) => {
        this.volume = data.volume
    })

    this.positionText = this.add.text(25, 25, `${this.game.input.mousePointer.x},${this.game.input.mousePointer.y}`, textStyles)
    this.positionText.fixedToCamera = true


    /**
     * Camera Settings
     */
    this.camera.follow(this.player)


    /**
     * Resizing Events
     */
    window.addEventListener('resize', () => {
        this.game.scale.refresh()
        this.game.height = window.innerHeight
        this.game.width = window.innerWidth
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
