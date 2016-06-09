import { PropTypes } from 'react'

import actions from '../../actions'

const propTypes = {
    deadNickname: PropTypes.string.isRequired,
    attackerNickname: PropTypes.string,
    weaponId: PropTypes.string
}

export default function onPlayerKillLog(data) {
    check(data, propTypes)

    this.game.store.dispatch(actions.killLog.addKillLog(data))
    setTimeout(() => {
        this.game.store.dispatch(actions.killLog.removeKillLog(data))
    }, 10000)
}
