import { PropTypes } from 'react'

import actions from '../../actions'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    playerNickname: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
}

export default function onBulletFired(data) {
    this.game.store.dispatch(actions.game.addChatMessage(data))
}
