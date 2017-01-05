// @flow
import React, { PureComponent } from 'react'
import autobind from 'react-autobind'

import GameConsts from 'lib/GameConsts'
import WeaponButton from './WeaponButton'

export default class WeaponsView extends PureComponent {
  constructor(props) {
    super(props)
    autobind(this)
  }

  props: Props

  handlePrimaryViewClick() {
    this.props.onViewChange('choosePrimary')
  }

  handleSecondaryViewClick() {
    this.props.onViewChange('chooseSecondary')
  }

  render() {
    const {
            nextSelectedPrimaryWeaponId,
            nextSelectedSecondaryWeaponId,
        } = this.props.player

    const primaryWeapon = GameConsts.WEAPONS[nextSelectedPrimaryWeaponId]
    const secondaryWeapon = GameConsts.WEAPONS[nextSelectedSecondaryWeaponId]

    return (
            <div>
                <div className="row">
                    <div className="col-sm-6">
                        <label>Primary Weapon</label>
                        <WeaponButton
                            onClick={ this.handlePrimaryViewClick }
                            weapon={ primaryWeapon }
                        />
                    </div>
                    <div className="col-sm-6">
                        <label>Secondary Weapon</label>
                        <WeaponButton
                            onClick={ this.handleSecondaryViewClick }
                            weapon={ secondaryWeapon }
                        />
                    </div>
                </div>

                <div className="row" style={ { marginBottom: '15px' } }>
                    <div className="col-sm-12">
                        <em>Fire rate calculated in rounds per second.</em>
                    </div>
                </div>
            </div>
        )
  }
}

type Props = {
    game: Object,
    onViewChange: Function,
    player: Object,
}
