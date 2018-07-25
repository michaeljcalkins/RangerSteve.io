import React, { Component, PropTypes } from 'react'
import autobind from 'react-autobind'

import GameConsts from 'lib/GameConsts'

export default class HudNewChatMessage extends Component {
  constructor (props) {
    super(props)
    autobind(this)
  }

  componentWillReceiveProps () {
    const { isOpen } = this.props
    if (isOpen) this.refs.messageInput.focus()
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
    const { isOpen, newChatMessageCharacter } = this.props

    if (!isOpen) {
      return (
        <div className='hud-new-chat-message no-pointer-events'>
          <div className='hud-chat-message'>
            Press { String.fromCharCode(newChatMessageCharacter) } to chat
          </div>
        </div>
      )
    }

    return (
      <div className='hud-new-chat-message'>
        <div className='hud-chat-message'>
          <input
            maxLength={GameConsts.MAX_CHAT_MESSAGE_LENGTH}
            onKeyPress={this.handleKeypressSendMessage}
            onBlur={this.props.onBlur}
            placeholder='Push enter to send...'
            ref='messageInput'
            type='text'
          />
        </div>
      </div>
    )
  }
}

HudNewChatMessage.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  newChatMessageCharacter: PropTypes.number.isRequired,
  onBlur: PropTypes.func.isRequired
}
