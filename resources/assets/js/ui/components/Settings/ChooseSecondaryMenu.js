import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function ChooseSecondaryMenu({
    onSecondaryGunClick,
    onViewChange,
    player
}) {
    const secondaryWeapons = GameConsts.SECONDARY_WEAPONS

    function handleSelectPrimaryClick(weapon) {
        if (player.meta.score < weapon.minScore)
            return

        onSecondaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return secondaryWeapons.map(function(weapon, index) {
            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    key={ index }
                    onClick={ handleSelectPrimaryClick.bind(this, weapon) }
                >
                    <div
                        className="option-screen"
                        v-show="player.meta.score < weapon.minScore"></div>
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
    player: PropTypes.object.isRequired
}
