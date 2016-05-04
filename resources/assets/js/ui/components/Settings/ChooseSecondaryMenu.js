import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function ChooseSecondaryMenu({
    onViewChange,
    onSecondaryGunClick,
    player
}) {
    const secondaryWeapons = GameConsts.SECONDARY_WEAPONS

    function handleSelectPrimaryClick(weapon) {
        if (this.player.meta.score < weapon.minScore)
            return

        this.onSecondaryGunClick(weapon)
        this.onViewChange('main')
    }

    function renderWeapons() {
        return secondaryWeapons.map(function(weapon, index) {
            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    key={ index }
                    onClick={ handleSelectPrimaryClick(weapon) }
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
