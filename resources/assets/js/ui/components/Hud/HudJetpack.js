import React, { PureComponent, PropTypes } from 'react'

export default class HudJetpack extends PureComponent {
  static propTypes = {
    fuelRemaining: PropTypes.number.isRequired
  }

  static defaultProps = {
    fuelRemaining: 0
  }

  render () {
    return (
      <div className='hud-jetpack hud-item'>
        <div className='hud-jetpack-fuel-cointainer'>
          <div className='hud-jetpack-fuel' style={{ width: `${this.props.fuelRemaining}%` }}>&nbsp;</div>
        </div>
      </div>
    )
  }
}
