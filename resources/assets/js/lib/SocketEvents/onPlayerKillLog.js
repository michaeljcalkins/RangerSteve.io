import { PropTypes } from 'react'
import EventHandler from '../EventHandler'

const propTypes = {
    deadNickname: PropTypes.string.isRequired,
    attackerNickname: PropTypes.string.isRequired,
    weaponId: PropTypes.string.isRequired
}

export default function onPlayerKillLog(data) {
    check(data, propTypes)
    EventHandler.emit('player kill log', data)
}
