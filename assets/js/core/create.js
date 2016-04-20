import GameConsts from '../lib/GameConsts'
import SetEventHandlers from '../lib/SocketEvents/SetEventHandlers'
import EventHandler from '../lib/EventHandler'
import HighRuleJungle from '../maps/HighRuleJungle'
import PlayerSpriteHandler from '../lib/PlayerSpriteHandler'

export default function Create() {
    this.volume = GameConsts.STARTING_VOLUME
    this.socket = io.connect()
    this.enemies = this.game.add.group()
    this.enemyBullets = []


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

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

    // Flag to track if the jump button is pressed
    this.jumping = false

    PlayerSpriteHandler.call(this)

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

        this.currentWeaponSprite.loadTexture(this.player.meta[this.currentWeapon].id)
        this.currentWeaponSprite.x = this.player.meta[this.currentWeapon].spriteX
        this.currentWeaponSprite.y = this.player.meta[this.currentWeapon].spriteY
        this.currentWeaponSprite.scale.setTo(this.player.meta[this.currentWeapon].scale)
        this.currentWeaponSprite.rotation = this.player.meta[this.currentWeapon].rotation
    })


    /**
     * Start listening for events
     */
    SetEventHandlers.call(this)
}
