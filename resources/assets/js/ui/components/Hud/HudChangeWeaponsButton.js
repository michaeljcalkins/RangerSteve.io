import React, { PropTypes } from 'react'

export default function HudSettingsButton ({
    onButtonClick
}) {
  return (
    <div
      className='hud-change-weapons-button hud-item'
      onClick={onButtonClick}
        >
            Weapons
        </div>
  )
}

HudSettingsButton.propTypes = {
  onButtonClick: PropTypes.func.isRequired
}
