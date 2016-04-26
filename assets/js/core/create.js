import GameConsts from '../lib/GameConsts'
import SetEventHandlers from '../lib/SocketEvents/setEventHandlers'
import EventHandler from '../lib/EventHandler'
import * as HighRuleJungle from '../maps/HighRuleJungle'
import PlayerSpriteHandler from '../lib/PlayerSpriteHandler'
import GetQueryString from '../lib/GetQueryString'

export default function Create() {
    this.roomId = GetQueryString('roomId')
    this.volume = GameConsts.STARTING_VOLUME
    this.socket = io.connect()
    this.enemies = this.game.add.group()
    this.enemyBullets = []
    this.jumping = false

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
    HighRuleJungle.create.call(this)


    /**
     * Bullet Settings
     */
    this.bullets = this.game.add.group()
    this.bullets.enableBody = true
    this.physicsBodyType = Phaser.Physics.ARCADE
    this.bullets.createMultiple(50, 'bullet')
    this.bullets.setAll('checkWorldBounds', true)
    this.bullets.setAll('outOfBoundsKill', true)

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

    PlayerSpriteHandler.call(this)
    HighRuleJungle.createOverlays.call(this)

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

    this.positionText = this.add.text(300, 300, `${this.game.input.mousePointer.x},${this.game.input.mousePointer.y}`, textStyles)
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
        this.currentWeaponSprite.scale.setTo(this.player.meta[this.currentWeapon].meta.scale)
        this.currentWeaponSprite.rotation = this.player.meta[this.currentWeapon].meta.rotation

        if (this.player.meta.facing === 'left') {
            this.currentWeaponSprite.x = this.player.meta[this.currentWeapon].meta.leftFaceX
            this.currentWeaponSprite.y = this.player.meta[this.currentWeapon].meta.leftFaceY
            this.currentWeaponSprite.scale.y *= -1
        } else {
            this.currentWeaponSprite.x = this.player.meta[this.currentWeapon].meta.rightFaceX
            this.currentWeaponSprite.y = this.player.meta[this.currentWeapon].meta.rightFaceY
        }

        this.muzzleFlash.x = this.player.meta[this.currentWeapon].meta.muzzleFlashX
        this.muzzleFlash.y = this.player.meta[this.currentWeapon].meta.muzzleFlashY
    })

    this.deathSprite = this.add.sprite(this.player.x, this.player.y, 'death')
    this.deathSprite.scale.setTo(.17)
    this.deathSprite.animations.add('playerDeath', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21], 20)
    this.deathSprite.visible = false

    /**
     * Start listening for events
     */
    SetEventHandlers.call(this)
}
