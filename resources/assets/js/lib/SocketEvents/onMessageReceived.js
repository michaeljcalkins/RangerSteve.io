import { PropTypes } from 'react'

import actions from '../../actions'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    playerNickname: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
}

export default function onBulletFired(data) {
    check(data, propTypes)

    this.game.store.dispatch(actions.chatMessages.addMessage(data))
}
