import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import autobind from 'react-autobind'

import GameConsts from 'lib/GameConsts'

export default class HudNewChatMessage extends React.Component {
    constructor(props) {
        super(props)
        autobind(this)
    }

    componentDidUpdate() {
        if (this.props.isOpen)
            ReactDOM.findDOMNode(this.refs.messageInput).focus()
    }

    handleKeypressSendMessage(evt) {
        if (evt.key !== 'Enter') return
        this.handleSendMessage()
    }

    handleSendMessage() {
        this.props.onSendMessage(this.refs.messageInput.value)
        this.refs.messageInput.value = ''
    }

    render() {
        if (! this.props.isOpen)
            return null

        return (
            <li className="hud-chat-message">
                <input
                    maxLength={ GameConsts.MAX_CHAT_MESSAGE_LENGTH }
                    onKeyPress={ this.handleKeypressSendMessage }
                    placeholder="Push enter to send..."
                    ref="messageInput"
                    type="text"
                />
            </li>
        )
    }
}

HudNewChatMessage.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onSendMessage: PropTypes.func.isRequired,
}
