import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import autobind from 'react-autobind'

export default class HudNewChatMessage extends React.Component {
    constructor(props) {
        super(props)
        autobind(this)
    }

    componentDidUpdate() {
        if (this.props.isOpen)
            ReactDOM.findDOMNode(this.refs.messageInput).focus()
    }

    handleKepressSendMessage(evt) {
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
                    onKeyPress={ this.handleKepressSendMessage }
                    placeholder="Push enter to send..."
                    ref="messageInput"
                    type="text"
                />
                <button
                    className="btn btn-sm btn-link"
                    onClick={ this.handleSendMessage }
                >
                    Send
                </button>
            </li>
        )
    }
}

HudNewChatMessage.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onSendMessage: PropTypes.func.isRequired,
}
