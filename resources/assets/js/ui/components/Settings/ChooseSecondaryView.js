import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'
import WeaponStats from './WeaponStats'

export default function ChooseSecondaryMenu({
    onSecondaryGunClick,
    onViewChange
}) {
    function handleSelectSecondaryClick(weapon) {
        mixpanel.track('secondaryWeapon:selected:' + weapon.id)
        onSecondaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return GameConsts.SECONDARY_WEAPON_IDS.map(function(weaponId, index) {
            const weapon = GameConsts.WEAPONS[weaponId]

            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    key={ index }
                    onClick={ handleSelectSecondaryClick.bind(this, weapon) }
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
        <div className="row">
            <div className="col-sm-12">
                <label>Choose Your Secondary Weapon</label>
                <em className="pull-right">(Changes take effect when you respawn)</em>
                <div className="options-menu">
                    { renderWeapons() }
                </div>
            </div>
        </div>
    )
}

ChooseSecondaryMenu.propTypes = {
    onSecondaryGunClick: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
    player: PropTypes.object
}
