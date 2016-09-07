import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function HudKillLog({
    messages
}) {
    function renderMessages() {
        return messages.slice(-5).map(function(message, index) {
            const selectedWeapon = GameConsts.WEAPONS[message.weaponId]
            if (! selectedWeapon) return

            if (! message.attackerNickname) {
                return (
                    <li key={ index }>
                         { message.deadNickname } <img height="32" src="/images/icons/skull-32-black.png" />
                    </li>
                )
            }

            return (
                <li key={ index }>
                    { message.attackerNickname } <img src={ selectedWeapon.image } /> { message.deadNickname }
                </li>
            )
        })
    }

    return (
        <div className="hud-kill-log">
            <ul className="list-unstyled">
                { renderMessages() }
            </ul>
        </div>
    )
}

HudKillLog.defaultProps = {
    messages: []
}

HudKillLog.propTypes = {
    messages: PropTypes.array
}
