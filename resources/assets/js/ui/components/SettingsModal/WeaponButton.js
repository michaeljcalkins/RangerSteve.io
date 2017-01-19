import React, { PropTypes } from 'react'
import WeaponStats from './WeaponStats'

export default function WeaponButton ({
    onClick,
    weapon
}) {
  function renderWeaponImage () {
    if (!weapon) return null
    return <img src={'/images/guns/large/' + weapon.image} />
  }

  if (!weapon) return null

  return (
    <div
      className='option-group option-group-lg option-character-group align-middle'
      id='open-primary-weapon-menu-button'
      onClick={onClick}
        >
      <div>
        { renderWeaponImage() }
      </div>
      <span className='option-name'>{ weapon.name }</span>
      <WeaponStats weapon={weapon} />
    </div>
  )
}

WeaponButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  weapon: PropTypes.object.isRequired
}
