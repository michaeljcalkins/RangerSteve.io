import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function ChoosePrimaryMenu({
    onViewChange,
    onPrimaryGunClick
}) {
    function handleSelectPrimaryClick(weapon) {
        mixpanel.track('primaryWeapon:selected:' + weapon.id)
        onPrimaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return GameConsts.PRIMARY_WEAPON_IDS.map(function(weaponId, index) {
            const weapon = GameConsts.WEAPONS[weaponId]

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
    onViewChange: PropTypes.func.isRequired,
    player: PropTypes.object
}
