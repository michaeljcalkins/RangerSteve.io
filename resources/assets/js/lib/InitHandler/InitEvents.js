import EventHandler from '../EventHandler'
import emitPlayerUpdateWeapon from '../SocketEvents/emitPlayerUpdateWeapon'
import actions from '../../actions'

export default function() {

    EventHandler.on('primary weapon update', (weapon) => {
        this.game.store.getState().player.selectedPrimaryWeaponId = weapon.id
    })

    EventHandler.on('secondary weapon update', (weapon) => {
        this.game.store.getState().player.selectedSecondaryWeaponId = weapon.id
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
        this.game.store.dispatch(actions.game.openChatModal())
    })

    // Open settings modal
    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(() => {
        this.game.store.dispatch(actions.game.openSettingsModal())
    })

    // Switch weapons
    this.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => {
        let currentWeapon = this.game.store.getState().player.currentWeapon

        if (currentWeapon === 'primaryWeapon') {
            this.game.store.dispatch(actions.player.setCurrentWeapon('secondaryWeapon'))
        } else {
            this.game.store.dispatch(actions.player.setCurrentWeapon('primaryWeapon'))
        }

        currentWeapon = this.game.store.getState().player.currentWeapon

        this.currentWeaponSprite.loadTexture(this.player.meta[currentWeapon].meta.id)
        this.currentWeaponSprite.scale.setTo(this.player.meta[currentWeapon].meta.scale)
        this.currentWeaponSprite.rotation = this.player.meta[currentWeapon].meta.rotation

        if (this.player.meta.facing === 'left') {
            this.currentWeaponSprite.x = this.player.meta[currentWeapon].meta.leftFaceX
            this.currentWeaponSprite.y = this.player.meta[currentWeapon].meta.leftFaceY
            this.currentWeaponSprite.scale.y *= -1
        } else {
            this.currentWeaponSprite.x = this.player.meta[currentWeapon].meta.rightFaceX
            this.currentWeaponSprite.y = this.player.meta[currentWeapon].meta.rightFaceY
        }

        this.muzzleFlash.x = this.player.meta[currentWeapon].meta.muzzleFlashX
        this.muzzleFlash.y = this.player.meta[currentWeapon].meta.muzzleFlashY

        const currentWeaponMeta = currentWeapon === 'primaryWeapon'
            ? this.player.meta.primaryWeapon.meta
            : this.player.meta.secondaryWeapon.meta

        emitPlayerUpdateWeapon.call(this, {
            id: '/#' + this.socket.id,
            roomId: this.roomId,
            currentWeaponMeta
        })
    })
}
