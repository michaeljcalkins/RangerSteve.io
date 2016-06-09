import emitPlayerUpdateWeapon from '../SocketEvents/emitPlayerUpdateWeapon'
import actions from '../../actions'

export default function() {
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
            id: '/#' + window.socket.id,
            roomId: this.roomId,
            currentWeaponMeta
        })
    })
}
