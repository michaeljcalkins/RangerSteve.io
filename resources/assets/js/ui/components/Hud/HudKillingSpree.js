import React, { PureComponent, PropTypes } from 'react'

export default class HudKillingSpree extends PureComponent {
  renderMessage () {
    let message = null
    const { killingSpreeCount } = this.props

    if (killingSpreeCount === 3) {
      message = 'TRIPLE KILL'
    } else if (killingSpreeCount === 4) {
      message = 'MULTI KILL'
    } else if (killingSpreeCount === 6) {
      message = 'ULTRA KILL'
    } else if (killingSpreeCount === 8) {
      message = 'KILLING SPREE'
    } else if (killingSpreeCount === 10) {
      message = 'UNSTOPPABLE'
    } else if (killingSpreeCount === 12) {
      message = 'LUDICROUS KILL'
    } else if (killingSpreeCount === 14) {
      message = 'RAMPAGE'
    } else if (killingSpreeCount === 15) {
      message = 'MONSTER KILL'
    }

    return message
  }

  render () {
    return (
      <div className='hud-killing-spree no-pointer-events'>
        { this.renderMessage() }
      </div>
    )
  }
}

HudKillingSpree.defaultProps = {
  killingSpreeCount: 0
}

HudKillingSpree.propTypes = {
  killingSpreeCount: PropTypes.number.isRequired
}
