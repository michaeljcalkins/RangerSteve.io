import React, { PureComponent, PropTypes } from 'react'
import autobind from 'react-autobind'
import upperCase from 'lodash/upperCase'

import GameConsts from 'lib/GameConsts'
import WeaponButton from './WeaponButton'

export default class WeaponsView extends PureComponent {
  constructor (props) {
    super(props)
    autobind(this)
  }

  static props = {
    game: PropTypes.object,
    mode: PropTypes.string,
    onViewChange: PropTypes.func,
    player: PropTypes.object
  }

  handlePrimaryViewClick () {
    this.props.onViewChange('choosePrimary')
  }

  handleSecondaryViewClick () {
    this.props.onViewChange('chooseSecondary')
  }

  renderMode (mode) {
    if (!mode) return

    const modeName = upperCase(GameConsts.MODES[mode])

    return <div className='alert alert-outline'>Changing weapons is disabled in the { modeName } mode.</div>
  }

  render () {
    const {
      nextSelectedPrimaryWeaponId,
      nextSelectedSecondaryWeaponId
    } = this.props.player

    const { player, mode } = this.props

    const primaryWeapon = GameConsts.WEAPONS[nextSelectedPrimaryWeaponId]
    const secondaryWeapon = GameConsts.WEAPONS[nextSelectedSecondaryWeaponId]
    const disabled = !!mode

    return (
      <div>
        { !player.isPremium &&
          <a
            class='btn btn-success btn-block mb3 btn-lg'
            href='/buy'
            v-if='!isPremium'
          >
            <img
              src='/images/icons/gold-crown.png'
              width='30'
              class='mr1'
              style='margin-top: -4px'
            />
            Buy Premium For Access To All Guns!
          </a>
        }
        {this.renderMode(mode)}
        <div className='row'>
          <div className='col-xs-6'>
            <label>Primary Weapon</label>
            <WeaponButton
              onClick={this.handlePrimaryViewClick}
              weapon={primaryWeapon}
              disabled={disabled}
            />
          </div>
          <div className='col-xs-6'>
            <label>Secondary Weapon</label>
            <WeaponButton
              onClick={this.handleSecondaryViewClick}
              weapon={secondaryWeapon}
              disabled={disabled}
            />
          </div>
        </div>

        <div className='row' style={{ marginBottom: '15px' }}>
          <div className='col-xs-12'>
            <em>Fire rate calculated in rounds per second.</em>
          </div>
        </div>
      </div>
    )
  }
}
