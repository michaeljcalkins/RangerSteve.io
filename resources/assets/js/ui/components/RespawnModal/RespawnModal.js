// @flow
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
// import emptyEventSchema from 'lib/schemas/emptyEventSchema'

export class RespawnModal extends PureComponent {
  constructor(props) {
    super(props)
    autobind(this)
  }

  state: Object = {
    autoRespawn: this.props.game.autoRespawn,
    oneTimeAutoRespawn: false,
    elapsed: 0,
    view: 'default',
  }

  componentDidMount() {
    this.timer = setInterval(this.tick.bind(this), 100)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  props: {
        player: Object,
        room: Object,
    }

  tick() {
    const { respawnTime } = this.props.player
    const currentTime = Math.floor(Date.now())
    const timeRemaining = respawnTime - currentTime
    let seconds = Number((timeRemaining / 1000).toFixed(1))
    if (seconds % 1 === 0) seconds = seconds + '.0'

    if (isNaN(seconds) || seconds <= 0) {
      this.setState({ elapsed: 0 })
      return
    }

    if ((this.state.autoRespawn || this.state.oneTimeAutoRespawn) && seconds <= 0.1) {
      this.handleRespawnButtonClick()
    }

    this.setState({ elapsed: seconds })
  }

  renderDamageGiven() {
    const { player, room } = this.props

    if (! get(player, 'attackingDamageStats.attackingDamage')) return null

    const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].data.nickname`, 'Enemy Player')
    const defendingHits = get(player, 'attackingDamageStats.attackingHits')
    const defendingDamage = get(player, 'attackingDamageStats.attackingDamage')

    return (
            <div>
                <strong className="text-success">Damage given:</strong>
                <strong>{ defendingDamage }</strong> in
                <strong>{ defendingHits } hits</strong>
                to { attackingPlayerName }
            </div>
        )
  }

  renderDamageTaken() {
    const { player, room } = this.props

    if (! player.damageStats) return null

    const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].data.nickname`, 'Enemy Player')
    const attackingHits = get(player, 'damageStats.attackingHits')
    const attackingDamage = get(player, 'damageStats.attackingDamage')

    return (
            <div>
                <strong className="text-danger">Damage taken:</strong> <strong>{ attackingDamage }</strong> in <strong>{ attackingHits } hits</strong> from { attackingPlayerName }
                <br />
            </div>
        )
  }

  handleDisabledRespawnButtonClick() {
    this.setState({
      ...this.state,
      oneTimeAutoRespawn: true,
    })
  }

  renderRespawnButton() {
    if (this.state.elapsed > 0) {
      return (
                <button
                    className="btn btn-primary btn-lg btn-block disabled"
                    onClick={ this.handleDisabledRespawnButtonClick }
                >
                    Respawning in { this.state.elapsed } seconds
                </button>
            )
    }

    return (
            <button
                className="btn btn-primary btn-lg btn-block"
                onClick={ this.handleRespawnButtonClick }
            >
                Respawn Now
            </button>
        )
  }

  renderCauseOfDeath() {
    const { player, room } = this.props
    const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].data.nickname`, 'Enemy Player')
    const selectedWeapon = get(GameConsts, `WEAPONS[${player.damageStats.weaponId}]`)
    const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)

    if (! attackingPlayerId) {
      return (
                <div className="row">
                    <div className="col-sm-6 text-right">
                        <img height="150" src="/images/ui/panel/suicide.png" />
                    </div>
                    <div className="col-sm-6 text-left">
                        <h4 style="margin-top: 60px;">You killed yourself...</h4>
                    </div>
                </div>
            )
    } else {
      return (
                <div className="row">
                    <div className="col-sm-5 text-right">
                        <img
                            className="weapon-image"
                            src={ '/images/guns/large/' + selectedWeapon.image }
                        />
                    </div>
                    <div className="col-sm-7 text-left">
                        <div style="margin-top: 60px;">
                            <h4><strong>{ attackingPlayerName }</strong> killed you with their <strong>{ selectedWeapon.name }</strong></h4>
                            { this.renderDamageTaken() }
                            { this.renderDamageGiven() }
                        </div>
                    </div>
                </div>
            )
    }
  }

  handleRespawnButtonClick() {
        // var buffer: Uint8Array = emptyEventSchema.encode()
    Client.send(GameConsts.EVENT.PLAYER_RESPAWN, {})
  }

  handleWeaponsViewClick(view) {
    this.props.onOpenSettingsModal()
    this.props.onSettingsViewChange(view)
  }

  handleRespawnChange(evt) {
    const autoRespawn = evt.target.checked
    this.setState({ autoRespawn })
    storage.set('autoRespawn', autoRespawn)
    this.props.onRespawnChange(autoRespawn)
  }

  render() {
    const { player, game } = this.props
    const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)
    const modalContentClasses = cs('modal-content', {
      'modal-content-suicide': ! attackingPlayerId,
    })

    return (
            <div>
                <div className="modal modal-respawn show">
                    <div className="modal-dialog">
                        <div className={ modalContentClasses }>
                            <div className="modal-header">
                                <h4 className="modal-title">Respawn</h4>
                            </div>
                            <div className="modal-body">
                                { this.renderCauseOfDeath() }

                                <WeaponsView
                                    game={ game }
                                    onViewChange={ this.handleWeaponsViewClick }
                                    player={ player }
                                />

                                <div className="row">
                                    <div className="col-sm-4 col-sm-offset-4">
                                        { this.renderRespawnButton() }
                                    </div>
                                    <div className="col-sm-4 text-left">
                                        <div className="checkbox" style="margin-top: 15px;">
                                            <label>
                                                <input
                                                    checked={ this.state.autoRespawn }
                                                    onClick={ this.handleRespawnChange }
                                                    type="checkbox"
                                                />
                                                Auto respawn
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop show" />
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
  const gameActions = bindActionCreators(actions.game, dispatch)

  return {
    onRespawnChange: gameActions.setAutoRespawn,
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RespawnModal)
