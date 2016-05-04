import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import EventHandler from '../../../lib/EventHandler'

export default class HudChatMessage extends React.Component {
    constructor(props) {
        super(props)

        this.handleSendMessage = this.handleSendMessage.bind(this)
    }

    componentDidUpdate() {
        ReactDOM.findDOMNode(this.refs.messageInput).focus()
    }

    handleSendMessage(evt) {
        if (evt.key !== 'Enter') return
        this.props.onSendMessage(this.refs.messageInput.value)
        this.refs.messageInput.value = ''
    }

    render() {
        const styleDisplay = this.props.isOpen ? 'block' : 'none'

        return (
            <div
                className="hud-chat-message hud-item"
                style={ { display: styleDisplay } }
            >
                <div className="form-group">
                    <textarea
                        className="form-control"
                        autoFocus
                        defaultValue=""
                        onKeyPress={ this.handleSendMessage }
                        placeholder="Push enter to send..."
                        ref="messageInput"
                    ></textarea>
                </div>
            </div>
        )
    }
}
