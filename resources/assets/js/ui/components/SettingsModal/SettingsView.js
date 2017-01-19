import React, { PropTypes, PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import autobind from 'react-autobind'
import storage from 'store'

import NameGenerator from '../../../lib/NameGenerator'
import GameConsts from 'lib/GameConsts'
import actions from 'actions'

export class SettingsView extends PureComponent {
  constructor (props) {
    super(props)
    autobind(this)

    this.state = {
      autoRespawn: props.game.autoRespawn,
      sfxVolume: props.game.sfxVolume,
      isNetworkStatsVisible: props.game.isNetworkStatsVisible,
      isFpsStatsVisible: props.game.isFpsStatsVisible,
      useWebgl: storage.get('useWebgl', true)
    }
  }

  props = {
    game: PropTypes.object,
    player: PropTypes.object
  }

  handleRespawnChange (evt) {
    const autoRespawn = evt.target.checked
    this.setState({ autoRespawn })
    storage.set('autoRespawn', autoRespawn)
    this.props.onAutoRespawnChange(autoRespawn)
  }

  handleNetworkStatsChange (evt) {
    const isNetworkStatsVisible = evt.target.checked
    this.setState({ isNetworkStatsVisible })
    storage.set('isNetworkStatsVisible', isNetworkStatsVisible)
    this.props.onNetworkStatsChange(isNetworkStatsVisible)
    document.location.reload()
  }

  handleWebglChange (evt) {
    const useWebgl = evt.target.checked
    this.setState({ useWebgl })
    storage.set('useWebgl', useWebgl)
    document.location.reload()
  }

  handleFpsStatsChange (evt) {
    const isFpsStatsVisible = evt.target.checked
    this.setState({ isFpsStatsVisible })
    storage.set('isFpsStatsVisible', isFpsStatsVisible)
    this.props.onFpsStatsChange(isFpsStatsVisible)
  }

  handleSoundEffectVolumeChange (evt) {
    const volume = Number(evt.currentTarget.value)
    storage.set('sfxVolume', volume)
    this.props.onSetSfxVolume(volume)
  }

  render () {
    return (
      <div>
        <div className='row'>
          <div className='col-sm-8 col-sm-offset-2'>
            <div className='form-group'>
              <label>Sound Effects Volume</label>
              <input
                defaultValue={this.state.sfxVolume}
                max='.13'
                min='0'
                onChange={this.handleSoundEffectVolumeChange}
                step='.01'
                type='range'
              />
            </div>
            <div className='checkbox'>
              <label>
                <input
                  checked={this.state.autoRespawn}
                  onClick={this.handleRespawnChange}
                  type='checkbox'
                />
                Auto respawn
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input
                  checked={this.state.isFpsStatsVisible}
                  onClick={this.handleFpsStatsChange}
                  type='checkbox'
                />
                Show FPS stats
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input
                  checked={this.state.isNetworkStatsVisible}
                  onClick={this.handleNetworkStatsChange}
                  type='checkbox'
                />
                Show Network stats <i>(Changing this will reload the game)</i>
              </label>
            </div>
            <div className='checkbox'>
              <label>
                <input
                  checked={this.state.useWebgl}
                  onClick={this.handleWebglChange}
                  type='checkbox'
                />
                Use WebGL renderer <i>(Changing this will reload the game)</i>
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    player: state.player,
    room: state.room,
    game: state.game
  }
}

const mapDispatchToProps = (dispatch) => {
  const playerActions = bindActionCreators(actions.player, dispatch)
  const gameActions = bindActionCreators(actions.game, dispatch)

  return {
    onSetSfxVolume: gameActions.setSfxVolume,
    onAutoRespawnChange: gameActions.setAutoRespawn,
    onNetworkStatsChange: gameActions.setIsNetworkStatsVisible,
    onFpsStatsChange: gameActions.setIsFpsStatsVisible
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsView)
