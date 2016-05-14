import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function HudKillLog({
    messages
}) {
    function renderMessages() {
        return messages.map(function(message, index) {
            let selectedWeapon = _.find(GameConsts.PRIMARY_WEAPONS, { id: message.weaponId })
            if (! selectedWeapon) {
                selectedWeapon = _.find(GameConsts.SECONDARY_WEAPONS, { id: message.weaponId })
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
