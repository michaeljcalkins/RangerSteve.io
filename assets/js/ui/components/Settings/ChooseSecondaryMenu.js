import React, { PropTypes } from 'react'

export default function ChooseSecondaryMenu(props) {
    const { onViewChange } = props

    let primaryWeapons = [
        {
            name: 'Desert Eagle',
            image: '/images/guns/Spr_DesertEagle.png'
        },
        {
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png'
        }
    ]

    function handleSelectPrimaryClick(evt) {
        console.log(evt.target.value)
        onViewChange('main')
    }

    function renderWeapons() {
        return primaryWeapons.map((weapon, index) => {
            return (
                <div
                    className="option-group option-weapon-group align-middle"
                    onClick={ handleSelectPrimaryClick }
                    value={ weapon.name }
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
                <label>Select a secondary weapon</label>
                <div className="options-menu">
                    { renderWeapons() }
                </div>
            </div>
        </div>
    )
}

ChooseSecondaryMenu.propTypes = {

}
