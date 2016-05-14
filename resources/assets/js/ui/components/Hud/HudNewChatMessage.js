import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class HudNewChatMessage extends React.Component {
    constructor(props) {
        super(props)

        this.handleSendMessage = this.handleSendMessage.bind(this)
    }

    componentDidUpdate() {
        if (this.props.isOpen)
            ReactDOM.findDOMNode(this.refs.messageInput).focus()
    }

    handleSendMessage(evt) {
        if (evt.key !== 'Enter') return
        this.props.onSendMessage(this.refs.messageInput.value)
        this.refs.messageInput.value = ''
    }

    render() {
        if (! this.props.isOpen)
            return null

        return (
            <div className="hud-chat-message hud-item">
                <div className="form-group">
                    <textarea
                        className="form-control"
                        onKeyPress={ this.handleSendMessage }
                        placeholder="Push enter to send..."
                        ref="messageInput"
                    ></textarea>
                </div>
            </div>
        )
    }
}

HudNewChatMessage.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onSendMessage: PropTypes.func.isRequired
}
