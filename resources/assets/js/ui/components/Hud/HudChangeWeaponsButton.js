import React, { PropTypes } from 'react'

export default function HudChangeWeaponsButton ({
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

HudChangeWeaponsButton.propTypes = {
  onButtonClick: PropTypes.func.isRequired
}
