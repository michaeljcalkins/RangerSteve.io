import React, { PropTypes } from 'react'

export default function ChoosePrimaryMenu(props) {
    const { onViewChange } = props

    let primaryWeapons = [
        {
            name: 'AK-47',
            image: '/images/guns/Spr_AK47.png'
        },
        {
            name: 'M500',
            image: '/images/guns/Spr_M500.png'
        },
        {
            name: 'Skorpion',
            image: '/images/guns/Spr_Skorpion.png'
        },
        {
            name: 'Aug',
            image: '/images/guns/Spr_Aug.png'
        },
        {
            name: 'G43',
            image: '/images/guns/Spr_g43.png'
        },
        {
            name: 'P90',
            image: '/images/guns/Spr_p90.png'
        },
        {
            name: 'M4A1',
            image: '/images/guns/Spr_M4A1.png'
        },
        {
            name: 'Barrett',
            image: '/images/guns/Spr_Barrett.png'
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
                <label>Select a primary weapon</label>
                <div className="options-menu">
                    { renderWeapons() }
                </div>
            </div>
        </div>
    )
}

ChoosePrimaryMenu.propTypes = {

}
