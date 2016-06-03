import { PropTypes } from 'react'
import EventHandler from '../EventHandler'

const propTypes = {
    deadNickname: PropTypes.string.isRequired,
    attackerNickname: PropTypes.string,
    weaponId: PropTypes.string
}

export default function onPlayerKillLog(data) {
    check(data, propTypes)
    EventHandler.emit('player kill log', data)
}
