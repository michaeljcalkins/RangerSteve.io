import store from 'store'
import GameConsts from '../lib/GameConsts'
import SetEventHandlers from '../lib/SocketEvents/setEventHandlers'
import EventHandler from '../lib/EventHandler'
import * as HighRuleJungle from '../maps/HighRuleJungle'
import PlayerSpriteHandler from '../lib/PlayerSpriteHandler'
import GetQueryString from '../lib/GetQueryString'
import emitPlayerUpdateWeapon from '../lib/SocketEvents/emitPlayerUpdateWeapon'

export default function Create() {
    this.roomId = GetQueryString('roomId')
    this.sfxVolume = store.get('sfxVolume', GameConsts.STARTING_SFX_VOLUME)
    this.musicVolume = store.get('musicVolume', GameConsts.STARTING_MUSIC_VOLUME)
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

    EventHandler.on('sfx volume update', (data) => this.sfxVolume = data.volume)
    EventHandler.on('music volume update', (data) => {
        this.audioPlayer.volume = data.volume
    })
    EventHandler.on('primary weapon update', (weapon) => this.player.meta.selectedPrimaryWeaponId = weapon.id)

    EventHandler.on('secondary weapon update', (weapon) => {
        this.player.meta.selectedSecondaryWeaponId = weapon.id
    })

    EventHandler.on('input enable', () => {
        this.game.input.enabled = true
    })

    EventHandler.on('input disable', () => {
        this.game.input.enabled = false
    })

    this.triplekillSound = this.game.add.audio('triplekill')
    EventHandler.on('play triplekill', () => {
        this.triplekillSound.volume = this.sfxVolume
        this.triplekillSound.play()
    })

    this.multikillSound = this.game.add.audio('multikill')
    EventHandler.on('play multikill', () => {
        this.multikillSound.volume = this.sfxVolume
        this.multikillSound.play()
    })

    this.ultrakillSound = this.game.add.audio('ultrakill')
    EventHandler.on('play ultrakill', () => {
        this.ultrakillSound.volume = this.sfxVolume
        this.ultrakillSound.play()
    })

    this.killingspreeSound = this.game.add.audio('killingspree')
    EventHandler.on('play killingspree', () => {
        this.killingspreeSound.volume = this.sfxVolume
        this.killingspreeSound.play()
    })

    this.unstoppableSound = this.game.add.audio('unstoppable')
    EventHandler.on('play unstoppable', () => {
        this.unstoppableSound.volume = this.sfxVolume
        this.unstoppableSound.play()
    })

    this.ludicrouskillSound = this.game.add.audio('ludicrouskill')
    EventHandler.on('play ludicrouskill', () => {
        this.ludicrouskillSound.volume = this.sfxVolume
        this.ludicrouskillSound.play()
    })

    this.rampagekillSound = this.game.add.audio('rampagekill')
    EventHandler.on('play rampagekill', () => {
        this.rampagekillSound.volume = this.sfxVolume
        this.rampagekillSound.play()
    })

    this.monsterkillSound = this.game.add.audio('monsterkill')
    EventHandler.on('play monsterkill', () => {
        this.monsterkillSound.volume = this.sfxVolume
        this.monsterkillSound.play()
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

        this.currentWeaponSprite.loadTexture(this.player.meta[this.currentWeapon].meta.id)
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

        let currentWeapon = this.currentWeapon === 'primaryWeapon' ? this.player.meta.primaryWeapon : this.player.meta.secondaryWeapon
        emitPlayerUpdateWeapon.call(this, {
            id: '/#' + this.socket.id,
            roomId: this.roomId,
            currentWeaponMeta: currentWeapon.meta
        })
    })


    /**
     * Player Is Hurt Border
     */
    this.hurtBorderSprite = this.add.sprite(0, 0, 'hurt-border')
    this.hurtBorderSprite.width = window.innerWidth
    this.hurtBorderSprite.height = window.innerHeight
    this.hurtBorderSprite.fixedToCamera = true

    /**
     * Audio
     */
    this.audioPlayer = new Audio()
    this.audioPlayer.controls = false
    this.audioPlayer.src = '/audio/ost.mp3'
    this.audioPlayer.volume = this.musicVolume
    this.audioPlayer.play()


    /**
     * Start listening for events
     */
    SetEventHandlers.call(this)
}
