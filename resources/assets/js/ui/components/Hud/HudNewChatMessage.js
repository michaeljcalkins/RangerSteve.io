import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class HudNewChatMessage extends React.Component {
    constructor(props) {
        super(props)

        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleKepressSendMessage = this.handleKepressSendMessage.bind(this)
    }

    componentDidUpdate() {
        if (this.props.isOpen)
            ReactDOM.findDOMNode(this.refs.messageInput).focus()
    }

    handleKepressSendMessage(evt) {
        if (evt.key !== 'Enter' || this.refs.messageInput.value.trim().length === 0) return
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
            <div className="hud-chat-message hud-item">
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
            </div>
        )
    }
}

HudNewChatMessage.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onSendMessage: PropTypes.func.isRequired
}
