import React, { PropTypes } from 'react'

export default function HudChat({
    messages
}) {
    function renderMessages() {
        return messages.map(function(message, index) {
            return (
                <li key={ index }>{ message.playerNickname }: { message.message }</li>
            )
        })
    }

    return (
        <div className="hud-chat">
            <ul className="list-unstyled">
                { renderMessages() }
            </ul>
        </div>
    )
}

HudChat.defaultProps = {
    messages: []
}

HudChat.propTypes = {
    messages: PropTypes.array
}
