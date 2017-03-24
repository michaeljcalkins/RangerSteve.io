import React, { PureComponent, PropTypes } from 'react'
import upperCase from 'lodash/upperCase'

import GameConsts from 'lib/GameConsts'

export default class HudGamemode extends PureComponent {
  static propTypes = {
    gamemode: PropTypes.string.isRequired,
    mod: PropTypes.string
  }

  static defaultProps = {
    gamemode: '',
    mod: ''
  }

  renderMod(mod) {
    if (!mod) return

    const modName = upperCase(GameConsts.MODS[mod])

    return <span className="text-yellow"> - { modName }</span>
  }

  render () {
    const { gamemode, mod } = this.props

    return (
      <div className='hud-gamemode hud-item'>{ upperCase(gamemode) }{ this.renderMod(mod) }</div>
    )
  }
}
