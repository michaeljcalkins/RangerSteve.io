import React, { PropTypes } from 'react'

export default function HudWeaponsInventory({
    currentWeapon
}) {
    const slots = [
        { id: 1, gun: 'Spr_AK47' },
        { id: 2, gun: 'Spr_Barrett' },
        { id: 3, gun: 'Spr_M4A1' },
        { id: 4, gun: 'Spr_DesertEagle' },
        { id: 5, gun: 'Spr_Aug' },
        { id: 6, gun: 'Spr_p90' },
        { id: 7, gun: 'Spr_Skorpion' },
        { id: 8, gun: 'Spr_M500' },
        { id: 9, gun: 'Spr_g43' },
        { id: 0, gun: 'Spr_RPG' }
    ]

    function renderWeaponSlots() {
        return slots.map((slot, index) => {
            let slotClasses = slot.id === currentWeapon ? 'active' : ''
            return (
                <div className={ slotClasses } key={ index }>
                    <span>{ slot.id }</span>
                    <img src={ "/images/guns/" + slot.gun + ".png" } />
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
