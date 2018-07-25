import React, { PureComponent, PropTypes } from 'react'
import upperCase from 'lodash/upperCase'

import GameConsts from 'lib/GameConsts'

export default class HudGamemode extends PureComponent {
  static propTypes = {
    gamemode: PropTypes.string.isRequired,
    mode: PropTypes.string
  }

  static defaultProps = {
    gamemode: '',
    mode: ''
  }

  renderMode (mode) {
    if (!mode) return

    const modName = upperCase(GameConsts.MODES[mode])

    return <span className='text-yellow'> - { modName }</span>
  }

  render () {
    const { gamemode, mode } = this.props

    return (
      <div className='hud-gamemode hud-item'>{ upperCase(gamemode) }{ this.renderMode(mode) }</div>
    )
  }
}
