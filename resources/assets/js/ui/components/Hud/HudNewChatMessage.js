import React, { Component, PropTypes } from 'react'
import autobind from 'react-autobind'

import GameConsts from 'lib/GameConsts'

export default class HudNewChatMessage extends Component {
  constructor (props) {
    super(props)
    autobind(this)
  }

  componentDidMount () {
    this.refs.messageInput.focus()
  }

  componentDidUpdate () {
    this.refs.messageInput.focus()
  }

  handleKeypressSendMessage (evt) {
    if (evt.key !== 'Enter') return
    this.handleSendMessage()
  }

  handleSendMessage () {
    this.props.onSendMessage(this.refs.messageInput.value)
    this.refs.messageInput.value = ''
  }

  render () {
    return (
      <li className='hud-chat-message'>
        <input
          maxLength={ GameConsts.MAX_CHAT_MESSAGE_LENGTH }
          onKeyPress={ this.handleKeypressSendMessage }
          onBlur={ this.props.onBlur }
          placeholder='Push enter to send...'
          ref='messageInput'
          type='text'
        />
      </li>
    )
  }
}

HudNewChatMessage.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
}
