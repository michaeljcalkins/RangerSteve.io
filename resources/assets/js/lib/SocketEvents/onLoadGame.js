import get from 'lodash/get'

import actions from 'actions'

export default function onLoadGame (data) {
  const store = this.game.store

  if (data.room.mod) {
    const weaponId = data.room.mod
    store.dispatch(actions.player.setSelectedPrimaryWeaponId(weaponId))
    store.dispatch(actions.player.setSelectedSecondaryWeaponId(weaponId))
    store.dispatch(actions.player.setPrimaryWeapon(weaponId))
    store.dispatch(actions.player.setSecondaryWeapon(weaponId))
    store.dispatch(actions.player.setNextSelectedPrimaryWeaponId(weaponId))
    store.dispatch(actions.player.setNextSelectedSecondaryWeaponId(weaponId))
  }
  store.dispatch(actions.room.setRoom(data.room))
  store.dispatch(actions.game.setChatMessages(get(data.room, 'messages', []).slice(-5)))
  store.dispatch(actions.player.setPlayer({
    initialPosition: {
      x: data.player.x,
      y: data.player.y
    }
  }))

  const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomId=' + data.room.id
  window.history.pushState({ path: newurl }, '', newurl)

  document.getElementById('loading-screen').style.display = 'flex'

  this.game.state.start('Game')
}
