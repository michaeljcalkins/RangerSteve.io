import React, { PropTypes } from 'react'

export default function HudWeaponsInventory({
    currentWeapon
}) {
    const slots = [
        { gun: 'Spr_AK47', className: 'weapon-ak47' },
        { gun: 'Spr_M500', className: 'weapon-m500' },
        { gun: 'Spr_Skorpion', className: 'weapon-skorpion' },
        { gun: 'Spr_Aug', className: 'weapon-aug' },
        { gun: 'Spr_g43', className: 'weapon-g43' },
        { gun: 'Spr_p90', className: 'weapon-p90' },
        { gun: 'Spr_DesertEagle', className: 'weapon-desert-eagle' },
        { gun: 'Spr_M4A1', className: 'weapon-m4a1' },
        { gun: 'Spr_Barrett', className: 'weapon-barrett' },
        { gun: 'Spr_RPG', className: 'weapon-rpg' }
    ]

    function renderWeaponSlots() {
        return slots.map((slot, index) => {
            let slotNumber = index + 1
            slotNumber = slotNumber > 9 ? 0 : slotNumber

            let slotClasses = slotNumber === currentWeapon ? 'active' : ''
            slotClasses += ` ${slot.className}`

            return (
                <div
                    className={ slotClasses }
                    key={ index }
                >
                    <span>{ slotNumber }</span>
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
