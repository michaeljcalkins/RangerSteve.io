import React, { PropTypes } from 'react'

export default function HudAmmo({
    ammoRemaining,
    currentWeapon,
    isPrimaryReloading,
    isSecondaryReloading
}) {
    function renderAmmoCount() {
        if (
            (currentWeapon === 'primaryWeapon' && isPrimaryReloading) || 
            (currentWeapon === 'secondaryWeapon' && isSecondaryReloading)
        ) {
            return <i className="fa fa-refresh fa-spin"></i>
        }

        return ammoRemaining
    }

    return (
        <div className="hud-ammo hud-item">
            <div className="hud-ammo-remaining">
                { renderAmmoCount() }
            </div>
        </div>
    )
}

HudAmmo.propTypes = {
    ammoRemaining: PropTypes.number
}
