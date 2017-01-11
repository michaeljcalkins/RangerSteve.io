import GameConsts from 'lib/GameConsts'
import getParameterByName from '../GetParameterByName.js'
import Client from '../Client'

export default function onSocketConnected() {
  const { store } = this.game
  const state = store.getState()

  Client.getId(id => {
    window.SOCKET_ID = id

    let data = {
      x: 0,
      y: 0,
      weaponId: state.player.currentWeapon === 'primaryWeapon'
                ? state.player.selectedPrimaryWeaponId
                : state.player.selectedSecondaryWeaponId,
      nickname: state.player.nickname,
    }

    // Only specify roomId if specified in url
    if (getParameterByName('roomId')) {
      mixpanel.track('player:joinedByRoomId')
      data.roomId = getParameterByName('roomId')
    }

    // Only specify map if specified in url
    if (getParameterByName('map')) {
      data.map = getParameterByName('map')
    }

    Client.send(GameConsts.EVENT.NEW_PLAYER, data)
  })
}
