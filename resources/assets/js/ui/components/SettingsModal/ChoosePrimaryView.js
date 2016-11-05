import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'
import WeaponStats from './WeaponStats'

export default function ChoosePrimaryMenu({
    onViewChange,
    onPrimaryGunClick,
}) {
    function handleSelectPrimaryClick(weapon) {
        mixpanel.track('primaryWeapon:selected:' + weapon.id)
        onPrimaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return GameConsts.PRIMARY_WEAPON_IDS.map(function(weaponId) {
            const weapon = GameConsts.WEAPONS[weaponId]

            return (
                <div
                    className="option-group align-middle"
                    onClick={ handleSelectPrimaryClick.bind(this, weapon) }
                    key={ 'primary' + weaponId }
                >
                    <div>
                        <img src={ '/images/guns/large/' + weapon.image } />
                    </div>
                    <span className="option-name">{ weapon.name }</span>
                    <WeaponStats weapon={ weapon } />
                </div>
            )
        })
    }

    return (
        <div>
            <div className="row">
                <div className="col-sm-12">
                    <label>Choose Your Primary Weapon</label>
                    <em className="pull-right">(Changes take effect when you respawn)</em>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <div className="options-menu">
                        { renderWeapons() }
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <em>Fire rate calculated in rounds per second.</em>
                </div>
            </div>
        </div>
    )
}

ChoosePrimaryMenu.propTypes = {
    onPrimaryGunClick: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
    player: PropTypes.object,
}
