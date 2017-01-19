import React, { PureComponent, PropTypes } from 'react'
import upperCase from 'lodash/upperCase'

export default class HudGamemode extends PureComponent {
  static propTypes = {
    gamemode: PropTypes.string.isRequired
  }

  static defaultProps = {
    gamemode: ''
  }

  render () {
    const { gamemode } = this.props

    return (
      <div className='hud-gamemode hud-item'>{ upperCase(gamemode) }</div>
    )
  }
}
