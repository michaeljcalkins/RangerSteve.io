import React, { PropTypes } from 'react'

import HudNewChatMessage from './HudNewChatMessage'

export default function HudChatHistory({
    messages,
    isOpen,
    onSendMessage
}) {
    function renderMessages() {
        if (messages.length === 0 && ! isOpen)
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
                <HudNewChatMessage
                    isOpen={ isOpen }
                    onSendMessage={ onSendMessage }
                />
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
