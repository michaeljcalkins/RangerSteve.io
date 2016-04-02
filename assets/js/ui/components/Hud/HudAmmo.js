import React, { PropTypes } from 'react'

export default function HudAmmo({
}) {
    return (
        <div className="hud-ammo hud-item">
            30
            <div className="progress">
                <div
                    style={ { width: '60%' } }
                    className="progress-bar"
                ></div>
            </div>
        </div>
    )
}

HudAmmo.propTypes = {
}
