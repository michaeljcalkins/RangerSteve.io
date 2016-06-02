import EventHandler from '../EventHandler'
import emitPlayerUpdateWeapon from '../SocketEvents/emitPlayerUpdateWeapon'

export default function() {
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
}
