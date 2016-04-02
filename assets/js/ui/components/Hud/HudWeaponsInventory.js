import React, { PropTypes } from 'react'

export default function HudWeaponsInventory({
    currentWeapon
}) {
    const slotNumbers = [1,2,3,4,5,6,7,8,9,0]

    function renderWeaponSlots() {
        return slotNumbers.map((slot, index) => {
            let slotClasses = slot === currentWeapon ? 'active' : ''
            return (
                <div className={ slotClasses } key={ index }>
                    <span>{ slot }</span>
                </div>
            )
        })
    }

    return (
        <div className="hud-weapons-inventory">
            { renderWeaponSlots() }
        </div>
    )
}

HudWeaponsInventory.propTypes = {
    currentWeapon: PropTypes.number.isRequired
}
