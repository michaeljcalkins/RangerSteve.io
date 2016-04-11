import React, { PropTypes } from 'react'

export default function ChooseSecondaryMenu({
    onViewChange,
    onSecondaryGunClick
}) {
    let primaryWeapons = [
        {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: '/images/guns/Spr_DesertEagle.png'
        },
        {
            id: 'RPG',
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png'
        }
    ]

    function handleSelectPrimaryClick(weapon) {
        onSecondaryGunClick(weapon)
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
    onViewChange: PropTypes.func.isRequired
}
