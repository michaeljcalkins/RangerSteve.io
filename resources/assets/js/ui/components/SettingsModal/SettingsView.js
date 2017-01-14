import React, { PropTypes, PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import autobind from 'react-autobind'
import storage from 'store'

import NameGenerator from '../../../lib/NameGenerator'
import GameConsts from 'lib/GameConsts'
import emitPlayerUpdateNickname from '../../../lib/SocketEvents/emitPlayerUpdateNickname'
import actions from 'actions'

export class SettingsView extends PureComponent {
  constructor(props) {
    super(props)
    autobind(this)

    this.state = {
      autoRespawn: props.game.autoRespawn,
      nickname: props.player.nickname,
      sfxVolume: props.game.sfxVolume,
      isNetworkStatsVisible: props.game.isNetworkStatsVisible,
      isFpsStatsVisible: props.game.isFpsStatsVisible,
    }
  }

  props: {
    game: PropTypes.object,
    player: PropTypes.object,
  }

  handleGenerateName() {
    const nickname = NameGenerator()
    this.refs.nicknameInput.value = nickname

    this.setNickname(nickname)
  }

  handleNicknameChange(evt) {
    if (this.state.nickname.length > GameConsts.MAX_NICKNAME_LENGTH) return

    const nickname = evt.currentTarget.value.substr(0, GameConsts.MAX_NICKNAME_LENGTH)
    this.setNickname(nickname)
  }

  setNickname(nickname) {
    this.setState({ nickname })
    storage.set('nickname', nickname)
    this.props.onNicknameChange(nickname)
    emitPlayerUpdateNickname(this.props.room.id, nickname)
  }

  handleRespawnChange(evt) {
    const autoRespawn = evt.target.checked
    this.setState({ autoRespawn })
    storage.set('autoRespawn', autoRespawn)
    this.props.onAutoRespawnChange(autoRespawn)
  }

  handleNetworkStatsChange(evt) {
    const isNetworkStatsVisible = evt.target.checked
    this.setState({ isNetworkStatsVisible })
    storage.set('isNetworkStatsVisible', isNetworkStatsVisible)
    this.props.onNetworkStatsChange(isNetworkStatsVisible)
    document.location.reload()
  }

  handleFpsStatsChange(evt) {
    const isFpsStatsVisible = evt.target.checked
    this.setState({ isFpsStatsVisible })
    storage.set('isFpsStatsVisible', isFpsStatsVisible)
    this.props.onFpsStatsChange(isFpsStatsVisible)
  }

  handleSoundEffectVolumeChange(evt) {
    const volume = Number(evt.currentTarget.value)
    storage.set('sfxVolume', volume)
    this.props.onSetSfxVolume(volume)
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="row">
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Nickname</label>
                  <input
                      className="form-control"
                      defaultValue={ this.state.nickname }
                      maxLength="25"
                      onChange={ this.handleNicknameChange }
                      ref="nicknameInput"
                      type="text"
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <button
                    className="btn btn-primary btn-sm btn-block"
                    onClick={ this.handleGenerateName }
                    style={ { marginTop: '25px' } }
                >
                  Random Nickname
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Sound Effects Volume</label>
              <input
                  defaultValue={ this.state.sfxVolume }
                  max=".13"
                  min="0"
                  onChange={ this.handleSoundEffectVolumeChange }
                  step=".01"
                  type="range"
              />
            </div>
            <div className="checkbox">
              <label>
                <input
                    checked={ this.state.autoRespawn }
                    onClick={ this.handleRespawnChange }
                    type="checkbox"
                />
                Auto respawn
              </label>
            </div>
            <div className="checkbox">
              <label>
                <input
                    checked={ this.state.isFpsStatsVisible }
                    onClick={ this.handleFpsStatsChange }
                    type="checkbox"
                />
                Show FPS stats
              </label>
            </div>
            <div className="checkbox">
              <label>
                <input
                  checked={ this.state.isNetworkStatsVisible }
                  onClick={ this.handleNetworkStatsChange }
                  type="checkbox"
                />
                Show Network stats <i>*</i>
              </label>
            </div>
            <hr/>
            <i>* Changing this option will reload the game automatically</i>
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
    game: state.game,
  }
}

const mapDispatchToProps = (dispatch) => {
  const playerActions = bindActionCreators(actions.player, dispatch)
  const gameActions = bindActionCreators(actions.game, dispatch)

  return {
    onSetSfxVolume: gameActions.setSfxVolume,
    onSetNickname: playerActions.setNickname,
    onNicknameChange: playerActions.setNickname,
    onAutoRespawnChange: gameActions.setAutoRespawn,
    onNetworkStatsChange: gameActions.setIsNetworkStatsVisible,
    onFpsStatsChange: gameActions.setIsFpsStatsVisible,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsView)
