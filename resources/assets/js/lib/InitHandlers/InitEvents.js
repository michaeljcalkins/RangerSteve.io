import emitPlayerUpdateWeapon from '../SocketEvents/emitPlayerUpdateWeapon'
import actions from '../../actions'

export default function() {
    // Open settings modal
    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(() => {
        this.game.store.dispatch(actions.game.openSettingsModal())
    })

    // Switch weapons
    this.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => {
        const currentWeapon = this.game.store.getState().player.currentWeapon
        if (currentWeapon === 'primaryWeapon') {
            this.game.store.dispatch(actions.player.setCurrentWeapon('secondaryWeapon'))
        } else {
            this.game.store.dispatch(actions.player.setCurrentWeapon('primaryWeapon'))
        }

        const newCurrentWeapon = this.game.store.getState().player.currentWeapon
        const state = this.game.store.getState()

        this.currentWeaponSprite.loadTexture(state.player[newCurrentWeapon].meta.id)
        this.currentWeaponSprite.scale.setTo(state.player[newCurrentWeapon].meta.scale)
        this.currentWeaponSprite.rotation = state.player[newCurrentWeapon].meta.rotation

        if (state.player.facing === 'left') {
            this.currentWeaponSprite.x = state.player[newCurrentWeapon].meta.leftFaceX
            this.currentWeaponSprite.y = state.player[newCurrentWeapon].meta.leftFaceY
            this.currentWeaponSprite.scale.y *= -1
        } else {
            this.currentWeaponSprite.x = state.player[newCurrentWeapon].meta.rightFaceX
            this.currentWeaponSprite.y = state.player[newCurrentWeapon].meta.rightFaceY
        }

        this.muzzleFlash.x = state.player[newCurrentWeapon].meta.muzzleFlashX
        this.muzzleFlash.y = state.player[newCurrentWeapon].meta.muzzleFlashY

        const currentWeaponMeta = newCurrentWeapon === 'primaryWeapon'
            ? state.player.primaryWeapon.meta
            : state.player.secondaryWeapon.meta

        emitPlayerUpdateWeapon.call(this, {
            id: '/#' + window.socket.id,
            roomId: state.room.id,
            currentWeaponMeta
        })
    })
}
