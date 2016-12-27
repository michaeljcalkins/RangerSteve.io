import React, { PropTypes } from 'react'
import autobind from 'react-autobind'

import GameConsts from 'lib/GameConsts'

export default class HudNewChatMessage extends React.Component {
    constructor(props) {
        super(props)
        autobind(this)
    }

    componentDidMount() {
        this.messageInput.focus();
    }

    componentDidUpdate() {
        this.messageInput.focus();
    }

    handleKeypressSendMessage(evt) {
        if (evt.key !== 'Enter') return
        this.handleSendMessage()
    }

    handleSendMessage() {
        this.props.onSendMessage(this.messageInput.value)
        this.messageInput.value = ''
    }

    render() {
        return (
            <li className="hud-chat-message">
                <input
                    maxLength={ GameConsts.MAX_CHAT_MESSAGE_LENGTH }
                    onKeyPress={ this.handleKeypressSendMessage }
                    placeholder="Push enter to send..."
                    ref={(input) => { this.messageInput = input }}
                    type="text"
                />
            </li>
        )
    }
}

HudNewChatMessage.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
}
