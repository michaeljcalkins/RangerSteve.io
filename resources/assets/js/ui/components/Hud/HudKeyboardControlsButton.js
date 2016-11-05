import React, { PropTypes } from 'react'

export default function HudKeyboardControlsButton({
    onButtonClick,
}) {
    return (
        <div
            className="hud-keyboard-controls-button hud-item"
            onClick={ onButtonClick }
        >
            Controls
        </div>
    )
}

HudKeyboardControlsButton.propTypes = {
    onButtonClick: PropTypes.func.isRequired,
}
