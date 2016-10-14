import React, { PropTypes } from 'react'

export default function HudSettingsButton({
    onButtonClick
}) {
    return (
        <div
            className="hud-settings hud-item"
            onClick={ onButtonClick }
        >Change Weapons</div>
    )
}

HudSettingsButton.propTypes = {
    onButtonClick: PropTypes.func.isRequired
}
