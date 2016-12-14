import GameConsts from 'lib/GameConsts'
import getParameterByName from '../GetParameterByName.js'
import Client from '../Client'

export default function onSocketConnected() {
    const { store } = this.game

    Client.getId(id => {
        window.SOCKET_ID = id

        if (getParameterByName('roomId')) {
            mixpanel.track('player:joinedByRoomId')
        }

        Client.send(GameConsts.EVENT.NEW_PLAYER, {
            roomId: getParameterByName('roomId'),
            map: getParameterByName('map'),
            x: 0,
            y: 0,
            weaponId: store.getState().player.currentWeapon === 'primaryWeapon'
                ? store.getState().player.selectedPrimaryWeaponId
                : store.getState().player.selectedSecondaryWeaponId,
            nickname: store.getState().player.nickname,
        })
    })
}
