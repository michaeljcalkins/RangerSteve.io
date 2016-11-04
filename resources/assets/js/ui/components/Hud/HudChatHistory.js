import React, { PropTypes } from 'react'

import HudNewChatMessage from './HudNewChatMessage'

export default function HudChatHistory({
    isOpen,
    messages,
    newChatMessageCharacter,
    onSendMessage,
}) {
    function renderMessages() {
        if (messages.length === 0 && ! isOpen)
            return (<li>Press { String.fromCharCode(newChatMessageCharacter) } to chat</li>)

        return messages.map(function(message, index) {
            return (
                <li key={ index } className="dont-break-out">
                    <strong>{ message.playerNickname }:</strong> { message.message }
                </li>
            )
        })
    }

    return (
        <div className="hud-chat no-pointer-events">
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
    isOpen: PropTypes.bool,
    messages: PropTypes.array,
    newChatMessageCharacter: PropTypes.number,
    onSendMessage: PropTypes.func
}
