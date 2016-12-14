import GameConsts from 'lib/GameConsts'
import getParameterByName from '../GetParameterByName.js'
// import Client from '../Client'

// 1. send new player
// 2. receive load game
// 3. send load complete
// 4. receive update players

export default function onSocketConnected() {
    const { store } = this.game

    window.socket.id(function (id) {
        window.SOCKET_ID = id

        if (getParameterByName('roomId')) {
            mixpanel.track('player:joinedByRoomId')
        }

        window.socket.write({
            type: GameConsts.EVENT.NEW_PLAYER,
            payload: {
                roomId: getParameterByName('roomId'),
                map: getParameterByName('map'),
                x: 0,
                y: 0,
                weaponId: store.getState().player.currentWeapon === 'primaryWeapon'
                    ? store.getState().player.selectedPrimaryWeaponId
                    : store.getState().player.selectedSecondaryWeaponId,
                nickname: store.getState().player.nickname,
            },
        })

        // Client.write(GameConsts.EVENT.NEW_PLAYER, {
        //     roomId: getParameterByName('roomId'),
        //     map: getParameterByName('map'),
        //     x: 0,
        //     y: 0,
        //     weaponId: store.getState().player.currentWeapon === 'primaryWeapon'
        //         ? store.getState().player.selectedPrimaryWeaponId
        //         : store.getState().player.selectedSecondaryWeaponId,
        //     nickname: store.getState().player.nickname,
        // })
    });
}
