import GameConsts from '../lib/GameConsts'
import SetEventHandlers from '../lib/SocketEvents/SetEventHandlers'
import EventHandler from '../lib/EventHandler'
import HighRuleJungle from '../maps/HighRuleJungle'
import Weapons from '../lib/Weapons'

export default function Create() {
    this.socket = io.connect()
    this.enemies = []
    this.volume = GameConsts.STARTING_VOLUME
    this.enemyBullets = this.game.add.group()

    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE)

    this.world.setBounds(0, 0, GameConsts.WORLD_WIDTH, GameConsts.WORLD_HEIGHT)

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.scale.setShowAll()
    this.game.scale.refresh()


    /**
     * Map
     */
    this.mapInstance = new HighRuleJungle(this)
    this.mapInstance.create()


    /**
     * Bullet Settings
     */
    this.bullets = this.game.add.group()
    this.bullets.enableBody = true
    this.physicsBodyType = Phaser.Physics.ARCADE
    this.bullets.createMultiple(50, 'bullet12')
    this.bullets.setAll('checkWorldBounds', true)
    this.bullets.setAll('outOfBoundsKill', true)


    /**
     * Player Settings
     */
    let spawnPoint = this.mapInstance.getRandomSpawnPoint()
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando')
    this.player.scale.setTo(GameConsts.PLAYER_SCALE)
    this.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.player)

    // Enable physics on the player
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE)

    // Make player collide with world boundaries so he doesn't leave the stage
    this.player.body.collideWorldBounds = true

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.setTo(GameConsts.MAX_SPEED, GameConsts.MAX_SPEED * 10) // x, y

    // Add drag to the player that slows them down when they are not accelerating
    this.player.body.drag.setTo(GameConsts.DRAG, 0) // x, y
    this.player.body.setSize(230, 290, -10, 0)
    this.player.meta = {
        health: 100
    }

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

    // Flag to track if the jump button is pressed
    this.jumping = false

    //  Our two animations, walking left and right.
    this.player.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    this.player.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)

    this.player.meta = {
        health: 100,
        primaryWeapon: new Weapons.AK47(this),
        secondaryWeapon: new Weapons.DesertEagle(this),
        selectedPrimaryWeaponId: 'AK47',
        selectedSecondaryWeaponId: 'DesertEagle'
    }

    this.player.meta.primaryWeapon.id = 'AK47'
    this.player.meta.secondaryWeapon.id = 'DesertEagle'

    this.leftArmGroup = this.game.add.group()
    this.rightArmGroup = this.game.add.group()
    this.headGroup = this.game.add.group()
    this.torsoGroup = this.game.add.group()

    // Torso
    this.torsoSprite = this.game.add.sprite(-37, -105, 'torso')
    this.torsoSprite.scale.setTo(1.8)
    this.torsoGroup.add(this.torsoSprite)

    // Head
    this.headSprite = this.game.add.sprite(0, -148, 'head')
    this.headSprite.scale.setTo(1.8)
    this.headGroup.add(this.headSprite)

    // Left arm
    this.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    this.leftArmSprite.anchor.setTo(.2, .2)
    this.leftArmSprite.scale.setTo(1.6)
    this.leftArmSprite.rotation = 80.1
    this.leftArmGroup.add(this.leftArmSprite)

    // Gun
    this.ak47Sprite = this.game.add.sprite(12, 19, 'AK47')
    this.ak47Sprite.scale.setTo(1.3)
    this.ak47Sprite.rotation = 80.15

    // Right arm
    this.rightArmGroup.add(this.ak47Sprite)
    this.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm')
    this.rightArmSprite.anchor.setTo(.2, .24)
    this.rightArmSprite.scale.setTo(1.7)
    this.rightArmSprite.rotation = 80.1
    this.rightArmGroup.add(this.rightArmSprite)

    this.player.addChild(this.leftArmGroup)
    this.leftArmGroup.pivot.x = 0
    this.leftArmGroup.pivot.y = 0
    this.leftArmGroup.x = 45
    this.leftArmGroup.y = -70

    this.player.addChild(this.torsoGroup)
    this.player.addChild(this.headGroup)

    this.player.addChild(this.rightArmGroup)
    this.rightArmGroup.pivot.x = 0
    this.rightArmGroup.pivot.y = 0
    this.rightArmGroup.x = -25
    this.rightArmGroup.y = -65


    /**
     * Weapons
     */
    this.currentWeapon = 'primaryWeapon'


    /**
     * Text
     */
    let textStyles = { fontSize: '14px', fill: '#000' }

    EventHandler.emit('score update', '')
    EventHandler.emit('health update', '')
    EventHandler.on('volume update', (data) => {
        this.volume = data.volume
    })

    EventHandler.on('primary weapon update', (weapon) => {
        this.player.meta.selectedPrimaryWeaponId = weapon.id
    })

    EventHandler.on('secondary weapon update', (weapon) => {
        this.player.meta.selectedSecondaryWeaponId = weapon.id
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
     * Keyboard Events
     */
    // Open settings modal
    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(function() {
        EventHandler.emit('settings open')
    })

    // Switch weapons
    this.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => {
        this.currentWeapon = this.currentWeapon === 'primaryWeapon'
            ? 'secondaryWeapon'
            : 'primaryWeapon'
        this.ak47Sprite.loadTexture(this.player.meta[this.currentWeapon].id)
    })


    /**
     * Start listening for events
     */
    SetEventHandlers.call(this)
}
