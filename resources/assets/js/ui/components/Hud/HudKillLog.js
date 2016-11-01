import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function HudKillLog({
    messages,
}) {
    function renderMessages() {
        return messages.slice(-5).map(function(message, index) {
            const selectedWeapon = GameConsts.WEAPONS[message.weaponId]
            const attackingPlayerNickname = message.attackerNickname ? message.attackerNickname : 'Unnamed Ranger'
            const deadPlayerNickname = message.deadNickname ? message.deadNickname : 'Unnamed Ranger'

            if (message.attackerNickname === undefined) {
                return (
                    <li key={ index }>
                         { deadPlayerNickname } <img height="32" src="/images/icons/skull-32-black.png" />
                    </li>
                )
            }

            if (! selectedWeapon) return

            return (
                <li key={ index }>
                    { attackingPlayerNickname } <img src={ '/images/guns/' + selectedWeapon.image } />
                    { message.wasHeadshot &&
                        <img
                            height="38"
                            src="/images/icons/headshot.png"
                            style={ { marginLeft: 0 } }
                        />
                    }
                    { deadPlayerNickname }
                </li>
            )
        })
    }

    return (
        <div className="hud-kill-log no-pointer-events">
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
