import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function HudKillLog({
    messages
}) {
    function renderMessages() {
        return messages.slice(-5).map(function(message, index) {
            const selectedWeapon = GameConsts.WEAPONS[message.weaponId]

            if (! message.attackerNickname) {
                return (
                    <li key={ index }>
                         { message.deadNickname } <img height="32" src="/images/icons/skull-32-black.png" />
                    </li>
                )
            }

            if (! selectedWeapon) return

            return (
                <li key={ index }>
                    { message.attackerNickname } <img src={ '/images/guns/' + selectedWeapon.image } />
                    { message.wasHeadshot &&
                        <img style={ { marginLeft: 0 } } height="38" src="/images/icons/headshot.png" />
                    }
                    { message.deadNickname }
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
