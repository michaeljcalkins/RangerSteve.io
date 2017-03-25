import get from 'lodash/get'

import actions from 'actions'
import GameConsts from 'lib/GameConsts'

export default function onLoadGame (data) {
  const store = this.game.store

  const playerState = store.getState().player
  let primaryWeaponId = playerState.nextSelectedPrimaryWeaponId
  let secondaryWeaponId = playerState.nextSelectedSecondaryWeaponId
  let currentWeapon = 'primaryWeapon'

  if (data.room.mode) {
    if (GameConsts.PRIMARY_WEAPON_IDS.indexOf(data.room.mode) >= 0) {
      primaryWeaponId = data.room.mode
    } else if (GameConsts.SECONDARY_WEAPON_IDS.indexOf(data.room.mode) >= 0) {
      secondaryWeaponId = data.room.mode
      currentWeapon = 'secondaryWeapon'
    }
  }

  const newPlayerState = {
    initialPosition: {
      x: data.player.x,
      y: data.player.y
    },
    currentWeapon,
    primaryWeapon: GameConsts.WEAPONS[primaryWeaponId],
    secondaryWeapon: GameConsts.WEAPONS[secondaryWeaponId],
    selectedPrimaryWeaponId: primaryWeaponId,
    selectedSecondaryWeaponId: secondaryWeaponId
  }

  store.dispatch(actions.player.setPlayer(newPlayerState))
  store.dispatch(actions.room.setRoom(data.room))
  store.dispatch(actions.game.setChatMessages(get(data.room, 'messages', []).slice(-5)))

  const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomId=' + data.room.id
  window.history.pushState({ path: newurl }, '', newurl)

  document.getElementById('loading-screen').style.display = 'flex'

  this.game.state.start('Game')
}
