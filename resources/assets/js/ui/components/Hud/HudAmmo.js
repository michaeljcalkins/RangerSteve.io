import React, { PureComponent, PropTypes } from 'react'

export default class HudAmmo extends PureComponent {
  static propTypes = {
    ammo: PropTypes.number.isRequired,
    isReloading: PropTypes.bool,
    isSwitching: PropTypes.bool
  }

  static defaultProps = {
    ammo: 0,
    isReloading: false,
    isSwitching: false
  }

  renderAmmo (ammo, isReloading, isSwitching) {
    if (isSwitching) return <i className='switching-weapon' />
    if (isReloading) return <i className='reloading-weapon' />
    return ammo
  }

  render () {
    const { ammo, isReloading, isSwitching } = this.props

    return (
      <div className='hud-ammo hud-item'>{ this.renderAmmo(ammo, isReloading, isSwitching) }</div>
    )
  }
}
