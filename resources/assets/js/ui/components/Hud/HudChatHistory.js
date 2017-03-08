import React, { PureComponent, PropTypes } from 'react'

export default class HudChatHistory extends PureComponent {
  renderMessages () {
    const { messages } = this.props

    // Array: [nickname, message]
    const formattedMessages = messages.map((message, index) => {
      return (
        <li className='hud-chat-message dont-break-out' key={'chat-message' + index}>
          <strong>{ message[0] }:</strong> { message[1] }
        </li>
      )
    })

    return formattedMessages
  }

  render () {
    return (
      <div className='hud-chat no-pointer-events'>
        <ul className='list-unstyled'>
          { this.renderMessages() }
        </ul>
      </div>
    )
  }
}

HudChatHistory.defaultProps = {
  messages: []
}

HudChatHistory.propTypes = {
  messages: PropTypes.array.isRequired
}
