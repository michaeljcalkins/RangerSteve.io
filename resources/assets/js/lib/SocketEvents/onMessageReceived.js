// @flow

import actions from 'actions'


export default function onBulletFired(data: array) {
    this.game.store.dispatch(actions.game.addChatMessage(data))
}
