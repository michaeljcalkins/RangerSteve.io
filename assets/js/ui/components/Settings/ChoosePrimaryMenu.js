import React, { PropTypes } from 'react'

import primaryWeapons from './PrimaryWeapons'

export default function ChoosePrimaryMenu({
    onViewChange,
    onPrimaryGunClick
}) {
    function handleSelectPrimaryClick(weapon) {
        onPrimaryGunClick(weapon)
        onViewChange('main')
    }

    function renderWeapons() {
        return primaryWeapons.map((weapon, index) => {
            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    onClick={ handleSelectPrimaryClick.bind(this, weapon) }
                    key={ index }
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
                <div className="options-menu">
                    { renderWeapons() }
                </div>
            </div>
        </div>
    )
}

ChoosePrimaryMenu.propTypes = {

}
