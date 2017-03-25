import React, { PureComponent } from 'react'
import autobind from 'react-autobind'
import upperCase from 'lodash/upperCase'

import GameConsts from 'lib/GameConsts'
import WeaponButton from './WeaponButton'

export default class WeaponsView extends PureComponent {
  constructor (props) {
    super(props)
    autobind(this)
  }

  props: Props

  handlePrimaryViewClick () {
    this.props.onViewChange('choosePrimary')
  }

  handleSecondaryViewClick () {
    this.props.onViewChange('chooseSecondary')
  }

  renderMod (mod) {
    if (!mod) return

    const modName = upperCase(GameConsts.MODS[mod])

    return <div className='alert alert-outline'>Changing weapons is disabled in the { modName } mod.</div>
  }

  render () {
    const {
      nextSelectedPrimaryWeaponId,
      nextSelectedSecondaryWeaponId
    } = this.props.player

    const mod = this.props.mod
    const primaryWeapon = GameConsts.WEAPONS[nextSelectedPrimaryWeaponId]
    const secondaryWeapon = GameConsts.WEAPONS[nextSelectedSecondaryWeaponId]
    const disabled = !!mod

    return (
      <div>
        {this.renderMod(mod)}
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

type Props = {
    game: Object,
    mod: String,
    onViewChange: Function,
    player: Object,
}
