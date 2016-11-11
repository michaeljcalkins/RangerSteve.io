import React, { PropTypes } from 'react'

export default function HudSettingsButton({
    onButtonClick,
}) {
    return (
        <div
            className="hud-settings-button hud-item"
            onClick={ onButtonClick }
        >
            Settings
        </div>
    )
}

HudSettingsButton.propTypes = {
    onButtonClick: PropTypes.func.isRequired,
}
