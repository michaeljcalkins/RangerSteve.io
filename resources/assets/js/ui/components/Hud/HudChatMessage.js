import React, { PropTypes } from 'react'

export default function HudChatMessage({
    onSendMessage,
    isOpen
}) {
    const styleDisplay = isOpen ? 'block' : 'none'

    function handleSendMessage(evt) {
        if (evt.key !== 'Enter') return
        onSendMessage(evt.target.value)
    }

    return (
        <div
            className="hud-chat-message hud-item"
            style={ { display: styleDisplay } }
        >
            <div className="form-group">
                <textarea
                    className="form-control"
                    onKeyPress={ handleSendMessage }
                    placeholder="Push enter to send or esc..."
                ></textarea>
            </div>
        </div>
    )
}
