import React, { PureComponent, PropTypes } from 'react'

export default class HudAmmo extends PureComponent {
  static propTypes = {
    ammo: PropTypes.number.isRequired,
    isReloading: PropTypes.bool.isRequired
  }

  static defaultProps = {
    ammo: 0,
    isReloading: false
  }

  render () {
    const { ammo, isReloading } = this.props

    return (
      <div className='hud-ammo hud-item'>{ isReloading ? '--' : ammo }</div>
    )
  }
}
