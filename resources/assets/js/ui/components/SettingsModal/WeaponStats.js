import React from 'react'

export default function ({ weapon }) {
  return (
    <div className='option-stats'>
      <div className='row'>
        <div className='col-sm-4'>
          <h5>Damage</h5>
          <h2>{ weapon.damage }</h2>
        </div>
        <div className='col-sm-4'>
          <h5>Fire Rate</h5>
          <h2>
            { (1000 / weapon.fireRate).toFixed(1) }
          </h2>
        </div>
        <div className='col-sm-4'>
          <h5>Capacity</h5>
          <h2>{ weapon.ammo }</h2>
        </div>
      </div>
    </div>
  )
}
