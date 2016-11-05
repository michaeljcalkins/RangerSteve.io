// @flow

import actions from '../../actions'


export default function onBulletFired(data: {
  roomId: string,
  playerNickname: string,
  playerId: string,
  message: string,
}) {
    this.game.store.dispatch(actions.game.addChatMessage(data))
}
