import React, { PropTypes } from 'react'

export default function HudChat({
    messages
}) {
    function renderMessages() {
        if (messages.length === 0)
            return (<li>Press T to chat</li>)

        return messages.slice(-5).map(function(message, index) {
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
