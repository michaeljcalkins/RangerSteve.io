// @flow
import autobind from 'react-autobind'
import React, { Component } from 'react'
import get from 'lodash/get'
import cs from 'classnames'

import WeaponsView from '../SettingsModal/WeaponsView'
import GameConsts from 'lib/GameConsts'
import emptyEventSchema from 'lib/schemas/emptyEventSchema'

export default class RespawnModal extends Component {
    constructor(props) {
        super(props)
        autobind(this)
    }

    props: Props

    state: Object = {
        view: 'default',
        elapsed: 0,
        copied: false,
    }

    componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
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

        this.setState({ elapsed: seconds })
    }

    renderDamageGiven() {
        const { player, room } = this.props

        if (! get(player, 'attackingDamageStats.attackingDamage')) return null

        const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
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

        const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const attackingHits = get(player, 'damageStats.attackingHits')
        const attackingDamage = get(player, 'damageStats.attackingDamage')

        return (
            <div>
                <strong className="text-danger">Damage taken:</strong> <strong>{ attackingDamage }</strong> in <strong>{ attackingHits } hits</strong> from { attackingPlayerName }
                <br />
            </div>
        )
    }

    renderRespawnButton() {
        if (this.state.elapsed > 0) {
            return (
                <button className="btn btn-primary btn-lg disabled">
                    Respawning in { this.state.elapsed } seconds
                </button>
            )
        }

        return (
            <button
                className="btn btn-primary btn-lg"
                onClick={ this.handleRespawnButtonClick }
            >
                Respawn Now
            </button>
        )
    }

    renderCauseOfDeath() {
        const { player, room } = this.props
        const attackingPlayerName = get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
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
        var buffer: Uint8Array = emptyEventSchema.encode()
        window.socket.emit('player respawn', buffer)
    }

    handleWeaponsViewClick(view) {
        this.props.onOpenSettingsModal()
        this.props.onSettingsViewChange(view)
    }

    render() {
        const { player, game } = this.props
        const attackingPlayerId = get(player, 'damageStats.attackingPlayerId', false)
        const modalContentClasses = cs('modal-content', {
            'modal-content-suicide': ! attackingPlayerId,
        })

        return (
            <div
                className="modal modal-respawn"
                style={ { display: 'block' } }
            >
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
                                <div className="col-sm-12 text-center">
                                    { this.renderRespawnButton() }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

type Props = {
    player: Object,
    room: Object,
}
