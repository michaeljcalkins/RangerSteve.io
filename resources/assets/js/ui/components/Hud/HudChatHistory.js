import React, { PropTypes } from 'react'

export default function HudChatHistory({
    messages
}) {
    function renderMessages() {
        if (messages.length === 0)
            return (<li>Press T to chat</li>)

        return messages.map(function(message, index) {
            return (
                <li key={ index }>
                    <strong>{ message.playerNickname }:</strong> { message.message }
                </li>
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

HudChatHistory.defaultProps = {
    messages: []
}

HudChatHistory.propTypes = {
    messages: PropTypes.array
}
