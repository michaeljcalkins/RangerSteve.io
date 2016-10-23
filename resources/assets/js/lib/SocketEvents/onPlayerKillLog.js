import { PropTypes } from 'react'

import actions from '../../actions'

const propTypes = {
    deadNickname: PropTypes.string.isRequired,
    attackerNickname: PropTypes.string,
    weaponId: PropTypes.string
}

export default function onPlayerKillLog(data) {
    const store = this.game.store

    store.dispatch(actions.game.addKillLogMessage(data))
    setTimeout(() => {
        store.dispatch(actions.game.removeKillLogMessage(data))
    }, 10000)
}
