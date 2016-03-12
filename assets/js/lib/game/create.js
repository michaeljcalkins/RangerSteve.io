'use strict'

let forestia = require('../../maps/forestia')
let weapons = require('../weapons')
let player = require('../player')

let worldWidth = 4000
let worldHeight = 1500

module.exports = function() {
    // Define movement constants
    this.MAX_SPEED = 400; // pixels/second
    this.ACCELERATION = 1960; // pixels/second/second
    this.DRAG = 1500; // pixels/second
    this.GRAVITY = 1900; // pixels/second/second
    this.JUMP_SPEED = -850; // pixels/second (negative y is up)

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

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Flag to track if the jump button is pressed
    this.jumping = false;


    /**
     * Map
     */
    forestia.create(this)


    /**
     * Player Settings
     */
    this.player = player.create.call(this)


    /**
     * Weapons
     */
    this.currentWeapon = 0;
    this.weapons.push(new weapons.aK47(this.game))
    this.weapons.push(new weapons.barretM82A1(this.game))


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
}
