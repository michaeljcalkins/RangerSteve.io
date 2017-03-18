import autobind from 'react-autobind'
import React, { PureComponent } from 'react'
import get from 'lodash/get'
import cs from 'classnames'
import storage from 'store'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import actions from 'actions'
import WeaponsView from '../SettingsModal/WeaponsView'
import GameConsts from 'lib/GameConsts'
import Client from '../../../lib/Client'

export class RespawnModal extends PureComponent {
  constructor (props) {
    super(props)
    autobind(this)
  }

  state = {
    isRespawning: false,
    autoRespawn: this.props.game.autoRespawn,
    oneTimeAutoRespawn: false,
    elapsed: 0,
    view: 'default'
  }

  componentDidMount () {
    this.timer = setInterval(this.tick.bind(this), 100)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
    this.setState({ isRespawning: false })
  }

  props: {
    player: Object,
    room: Object,
  }

  tick () {
    const { player, room } = this.props
    const { isRespawning } = this.state
    const timeRemaining = (player.canRespawnTime / 1000) - (room.currentTime / 1000)
    let seconds = Number((timeRemaining).toFixed(1))
    if (seconds % 1 === 0) seconds = seconds + '.0'

    // This allows you to have the auto respawn unchecked and then check it after
    // you have waited the respawn wait time without being force respawned
    if (isNaN(seconds) || seconds < -0.5) {
      this.setState({ elapsed: 0 })
      return
    }

    // Respawn when the wait time has elapsed
    if (
      (this.state.autoRespawn || this.state.oneTimeAutoRespawn) &&
      seconds <= 0 &&
      !isRespawning
    ) {
      this.setState({ isRespawning: true })
      this.handleRespawnButtonClick()
      return
    }

    this.setState({ elapsed: seconds })
  }

  renderDamageGiven () {
    const { player, room } = this.props

    if (!get(player, 'attackingDamageStats.attackingDamage')) return null

    const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].nickname`, 'Enemy Player')
    const defendingHits = get(player, 'attackingDamageStats.attackingHits')
    const defendingDamage = get(player, 'attackingDamageStats.attackingDamage')

    return (
      <div>
        <strong className='text-success'>Damage given:</strong><strong> { defendingDamage } </strong>
        in <strong>{ defendingHits } hits</strong> to { attackingPlayerName }
      </div>
    )
  }

  renderDamageTaken () {
    const { player, room } = this.props

    if (!player.damageStats) return null

    const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].nickname`, 'Enemy Player')
    const attackingHits = get(player, 'damageStats.attackingHits')
    const attackingDamage = get(player, 'damageStats.attackingDamage')

    return (
      <div>
        <strong className='text-danger'>Damage taken:</strong><strong> { attackingDamage } </strong>
        in <strong>{ attackingHits } hits</strong> from { attackingPlayerName }
        <br />
      </div>
    )
  }

  handleDisabledRespawnButtonClick () {
    this.setState({
      ...this.state,
      oneTimeAutoRespawn: true
    })
  }

  renderRespawnButton () {
    if (this.state.elapsed > 0) {
      return (
        <button
          className='btn btn-primary btn-lg btn-block disabled'
          onClick={this.handleDisabledRespawnButtonClick}
        >
          Respawning in { this.state.elapsed } seconds
        </button>
      )
    }

    return (
      <button
        className='btn btn-primary btn-lg btn-block'
        onClick={this.handleRespawnButtonClick}
      >
        Respawn Now
      </button>
    )
  }

  renderCauseOfDeath () {
    const { player, room } = this.props

    const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].nickname`, 'Enemy Player')
    const selectedWeapon = get(GameConsts, `WEAPONS[${player.damageStats.weaponId}]`)
    const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)

    if (!attackingPlayerId) {
      return (
        <div className='row'>
          <div className='col-xs-12 text-center'>
            <img height='100' src='/images/ui/panel/suicide.png' />
            <h4>You killed yourself...</h4>
          </div>
        </div>
      )
    } else {
      return (
        <div className='row'>
          <div className='col-xs-12 text-center'>
            <img
              className='weapon-image mb3'
              src={'/images/guns/large/' + selectedWeapon.image}
            />
            <h4><strong>{ attackingPlayerName }</strong> killed you with their <strong>{ selectedWeapon.name }</strong></h4>
            { this.renderDamageTaken() }
            { this.renderDamageGiven() }
          </div>
        </div>
      )
    }
  }

  handleRespawnButtonClick () {
    Client.send(GameConsts.EVENT.PLAYER_RESPAWN)
  }

  handleWeaponsViewClick (view) {
    this.props.onOpenSettingsModal()
    this.props.onSettingsViewChange(view)
  }

  handleRespawnChange (evt) {
    const autoRespawn = evt.target.checked
    this.setState({ autoRespawn })
    storage.set('autoRespawn', autoRespawn)
    this.props.onRespawnChange(autoRespawn)
  }

  render () {
    const { player, game } = this.props
    const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)
    const modalClasses = cs('modal', 'modal-respawn', {
      'show': !game.settingsModalIsOpen
    })
    const modalContentClasses = cs('modal-content', {
      'modal-content-suicide': !attackingPlayerId
    })

    return (
      <div>
        <div className={modalClasses}>
          <div className='modal-dialog'>
            <div className={modalContentClasses}>
              <div className='modal-header'>
                <h4 className='modal-title'>Respawn</h4>
              </div>
              <div className='modal-body'>
                <div className='row' style='margin: 20px 0;'>
                  <div className='col-xs-6'>
                    { this.renderCauseOfDeath() }
                  </div>
                  <div className='col-xs-6 text-center'>
                    <div style='margin-top: 30px;'>
                      { this.renderRespawnButton() }
                    </div>
                    <div className='checkbox' style='margin-top: 15px;'>
                      <label>
                        <input
                          checked={this.state.autoRespawn}
                          onClick={this.handleRespawnChange}
                          type='checkbox'
                        />
                        Auto respawn
                      </label>
                    </div>
                  </div>
                </div>

                <div className='row'>
                  <div className='col-xs-12'>
                    <WeaponsView
                      game={game}
                      onViewChange={this.handleWeaponsViewClick}
                      player={player}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='modal-backdrop show' />
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
  const gameActions = bindActionCreators(actions.game, dispatch)

  return {
    onRespawnChange: gameActions.setAutoRespawn
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RespawnModal)
