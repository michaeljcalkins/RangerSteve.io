import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import GameConsts from 'lib/GameConsts'
import WeaponStats from './WeaponStats'
import actions from 'actions'

export function ChooseSecondaryMenu ({
    onSettingsViewChange,
    onSecondaryGunClick,
    onCloseSettingsModal,
    player
}) {
  function handleSelectSecondaryClick (weapon) {
    mixpanel.track('secondaryWeapon:selected:' + weapon.id)
    onSecondaryGunClick(weapon)
    player.health <= 0
            ? onCloseSettingsModal()
            : onSettingsViewChange('main')
  }

  function renderWeapons () {
    return GameConsts.SECONDARY_WEAPON_IDS.map(function (weaponId, index) {
      const weapon = GameConsts.WEAPONS[weaponId]

      return (
        <div
          className='option-group option-weapon-group align-middle'
          key={index}
          onClick={handleSelectSecondaryClick.bind(this, weapon)}
                >
          <div>
            <img src={'/images/guns/large/' + weapon.image} />
          </div>
          <span className='option-name'>{ weapon.name }</span>
          <WeaponStats weapon={weapon} />
        </div>
      )
    })
  }

  return (
    <div>
      <div className='row'>
        <div className='col-sm-12'>
          <label>Choose Your Secondary Weapon</label>
          <em className='pull-right'>(Changes take effect when you respawn)</em>
        </div>
      </div>
      <div className='row'>
        <div className='col-sm-12'>
          <div className='options-menu'>
            { renderWeapons() }
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-sm-12'>
          <em>Fire rate calculated in rounds per second.</em>
        </div>
      </div>
    </div>
  )
}

ChooseSecondaryMenu.propTypes = {
  onCloseSettingsModal: PropTypes.func.isRequired,
  onSecondaryGunClick: PropTypes.func.isRequired,
  onSettingsViewChange: PropTypes.func.isRequired,
  player: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    player: state.player
  }
}

const mapDispatchToProps = (dispatch) => {
  const gameActions = bindActionCreators(actions.game, dispatch)

  return {
    onCloseSettingsModal: gameActions.closeSettingsModal,
    onSettingsViewChange: gameActions.setSettingsModalView
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ChooseSecondaryMenu)
