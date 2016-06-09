import React, { PropTypes } from 'react'
import storage from 'store'

import GameConsts from '../../../lib/GameConsts'

export default function ChoosePrimaryMenu({
    onViewChange,
    onPrimaryGunClick
}) {
    function handleSelectPrimaryClick(weapon) {
        storage.set('selectedPrimaryWeaponId', weapon.id)
        onPrimaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return GameConsts.PRIMARY_WEAPONS.map(function(weapon, index) {
            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    key={ index }
                    onClick={ handleSelectPrimaryClick.bind(this, weapon) }
                >
                    <div>
                        <img src={ weapon.image } />
                    </div>
                    <span className="option-name">{ weapon.name }</span>
                </div>
            )
        })
    }

    return (
        <div className="row">
            <div className="col-sm-12">
                <label>Select a Primary Weapon</label>
                <em className="pull-right">(Changes take effect when you respawn)</em>
                <div className="options-menu">
                    { renderWeapons() }
                </div>
            </div>
        </div>
    )
}

ChoosePrimaryMenu.propTypes = {
    onPrimaryGunClick: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired
}
