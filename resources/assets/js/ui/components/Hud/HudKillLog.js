import React, { PropTypes } from 'react'

export default function HudKillLog({
    messages
}) {
    function renderMessages() {
        return messages.map(function(message, index) {
            return (
                <li key={ index }>
                    { message.attackerNickname } <img src={ message.weaponId + '.png' } /> { message.deadNickname }
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
