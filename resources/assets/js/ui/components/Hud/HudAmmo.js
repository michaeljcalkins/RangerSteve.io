import React, { PropTypes } from 'react'

export default function HudAmmo({
    ammoRemaining
}) {
    function renderRemainingVisual() {
        let bulletSpans = _.range(0, ammoRemaining).map((key) => <span key={ key }></span>)

        return (
            <div className="hud-ammo-remaining-visual">
                { bulletSpans }
            </div>
        )
    }

    return (
        <div className="hud-ammo hud-item">
            <div className="hud-ammo-remaining">{ ammoRemaining }</div>
            { renderRemainingVisual() }
        </div>
    )
}

HudAmmo.propTypes = {
    ammoRemaining: PropTypes.number
}
