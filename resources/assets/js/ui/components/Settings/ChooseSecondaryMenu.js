import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

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
        return Object.keys(GameConsts.WEAPONS).map(function(weaponId, index) {
            const weapon = GameConsts.WEAPONS[weaponId]

            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    key={ index }
                    onClick={ handleSelectSecondaryClick.bind(this, weapon) }
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
                <label>Select a Secondary Weapon</label>
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
