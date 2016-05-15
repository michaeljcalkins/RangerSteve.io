import store from 'store'
import GameConsts from '../lib/GameConsts'
import SetEventHandlers from '../lib/SocketEvents/setEventHandlers'
import EventHandler from '../lib/EventHandler'
import * as HighRuleJungle from '../maps/HighRuleJungle'
import PlayerSpriteHandler from '../lib/PlayerSpriteHandler'
import GetQueryString from '../lib/GetQueryString'

export default function Create() {
    this.roomId = GetQueryString('roomId')
    this.volume = store.get('volume', GameConsts.STARTING_VOLUME)
    this.socket = io.connect()
    this.jumping = false

    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.physicsBodyType = Phaser.Physics.ARCADE
    this.world.setBounds(0, 0, GameConsts.WORLD_WIDTH, GameConsts.WORLD_HEIGHT)
    this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.scale.setShowAll()
    this.game.scale.refresh()


    /**
     * Map
     */
    HighRuleJungle.create.call(this)


    /**
     * Enemy Settings
     */
    this.enemies = this.game.add.group()
    this.enemies.enableBody = true
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE
    this.physics.arcade.enable(this.enemies)
    this.game.physics.enable(this.enemies, Phaser.Physics.ARCADE)


    /**
     * Bullet Settings
     */
    this.bullets = this.game.add.group()
    this.bullets.enableBody = true
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE
    this.bullets.createMultiple(50, 'bullet')
    this.bullets.setAll('checkWorldBounds', true)
    this.bullets.setAll('outOfBoundsKill', true)

    this.enemyBullets = this.game.add.group()
    this.enemyBullets.enableBody = true
    this.enemyBullets.createMultiple(50, 'bullet')
    this.enemyBullets.setAll('checkWorldBounds', true)
    this.enemyBullets.setAll('outOfBoundsKill', true)

    PlayerSpriteHandler.call(this)
    HighRuleJungle.createOverlays.call(this)

    this.groundSprite = this.add.sprite(0, 3964, 'ground')
    this.groundSprite.alpha = 0
    this.groundSprite.width = this.game.world.width
    this.groundSprite.height = 10
    this.physics.arcade.enable(this.groundSprite)
    this.game.physics.enable(this.groundSprite, Phaser.Physics.ARCADE)
    this.groundSprite.enableBody = true
    this.groundSprite.physicsBodyType = Phaser.Physics.ARCADE
    this.groundSprite.body.immovable = true
    this.groundSprite.body.allowGravity = false


    /**
     * Weapons
     */
    this.currentWeapon = 'primaryWeapon'


    /**
     * Events
     */
    EventHandler.emit('score update', 0)
    EventHandler.emit('health update', 0)
    EventHandler.emit('player update nickname', { nickname: this.player.meta.nickname })
    EventHandler.on('volume update', (data) => {
        this.volume = data.volume
    })

    EventHandler.on('primary weapon update', (weapon) => {
        this.player.meta.selectedPrimaryWeaponId = weapon.id
    })

    EventHandler.on('secondary weapon update', (weapon) => {
        this.player.meta.selectedSecondaryWeaponId = weapon.id
    })

    EventHandler.on('input enable', () => {
        this.game.input.enabled = true
    })

    EventHandler.on('input disable', () => {
        this.game.input.enabled = false
    })


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

        this.hurtBorderSprite.width = window.innerWidth
        this.hurtBorderSprite.height = window.innerHeight
    })


    /**
     * Keyboard Events
     */
    // Open chat
    this.input.keyboard.addKey(Phaser.Keyboard.T).onDown.add(() => {
        EventHandler.emit('chat open')
        this.game.input.enabled = false
    })

    // Open settings modal
    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(() => {
        EventHandler.emit('settings open')
        this.game.input.enabled = false
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

    this.hurtBorderSprite = this.add.sprite(0, 0, 'hurt-border')
    this.hurtBorderSprite.width = window.innerWidth
    this.hurtBorderSprite.height = window.innerHeight
    this.hurtBorderSprite.fixedToCamera = true


    /**
     * Start listening for events
     */
    SetEventHandlers.call(this)
}
