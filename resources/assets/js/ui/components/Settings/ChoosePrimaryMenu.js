import React, { PropTypes } from 'react'

import GameConsts from '../../../lib/GameConsts'

export default function ChoosePrimaryMenu({
    onViewChange,
    onPrimaryGunClick,
    player
}) {
    function handleSelectPrimaryClick(weapon) {
        if (player.score < weapon.minScore) return
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
                    { player.score < weapon.minScore
                        ? <div className="option-locked">LOCKED ({ weapon.minScore })</div>
                        : null
                    }
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
