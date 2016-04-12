import React, { PropTypes } from 'react'

import primaryWeapons from '../../../lib/PrimaryWeapons'

export default function ChoosePrimaryMenu({
    onViewChange,
    onPrimaryGunClick,
    player
}) {
    function handleSelectPrimaryClick(weapon) {
        if (player.meta.score < weapon.minScore)
            return

        onPrimaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return primaryWeapons.map((weapon, index) => {
            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    key={ index }
                    onClick={ handleSelectPrimaryClick.bind(this, weapon) }
                >
                    { player.meta.score < weapon.minScore
                        ? <div className="option-screen"></div>
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

    console.log(player)

    return (
        <div className="row">
            <div className="col-sm-12">
                <label>Select a Primary Weapon</label>
                <div className="options-menu">
                    { renderWeapons() }
                </div>
            </div>
        </div>
    )
}

ChoosePrimaryMenu.propTypes = {

}
