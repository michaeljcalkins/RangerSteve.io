import React, { PropTypes } from 'react'
import moment from 'moment'
import _ from 'lodash'

import GameConsts from '../../../lib/GameConsts'

export default class RespawnModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            elapsed: 0
        }
    }

    componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    tick() {
        const { respawnTime } = this.props.player
        const timeRemaining = respawnTime - moment().valueOf()
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

        if (! _.get(player, 'attackingDamageStats.attackingDamage')) return null

        return (
            <div>
                Damage given: <strong>{ player.attackingDamageStats.attackingDamage }</strong> in <strong>{ player.attackingDamageStats.attackingHits } hits</strong> to { room.players[player.damageStats.attackingPlayerId].meta.nickname }
            </div>
        )
    }

    renderDamageTaken() {
        const { player, room } = this.props

        if (! player.damageStats) return null

        return (
            <div>
                Damage taken: <strong>{ player.damageStats.attackingDamage }</strong> in <strong>{ player.damageStats.attackingHits } hits</strong> from { room.players[player.damageStats.attackingPlayerId].meta.nickname }<br />
            </div>
        )
    }

    renderCauseOfDeath() {
        const { player, room } = this.props
        const attackingPlayerName = _.get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`)
        const selectedWeapon = _.get(GameConsts, `WEAPONS[${player.damageStats.weaponId}]`)
        const attackingPlayerId = _.get(player, 'damageStats.attackingPlayerId', false)

        if (! attackingPlayerId) {
            return (
                <div className="media">
                    <div className="media-left">
                        <img className="media-object" src="/images/icons/skull-32-black.png" />
                    </div>
                    <div className="media-body">
                        <h4 className="media-heading" style={ { margin: '15px 0 0' } }>You killed yourself...</h4>
                    </div>
                </div>
            )
        }

        return (
            <div className="media">
                <div className="media-left">
                    <img
                        className="media-object"
                        src={ '/images/guns/' + selectedWeapon.image }
                    />
                </div>
                <div className="media-body">
                    <h4 className="media-heading">{ attackingPlayerName }</h4>
                    <strong><span className="text-danger">Killed you with their</span> <span className="text-primary">{ selectedWeapon.name }</span></strong><br />
                    { this.renderDamageTaken() }
                    { this.renderDamageGiven() }
                </div>
            </div>
        )
    }

    render() {
        const shareLink = window.location.href

        return (
            <div>
                <div
                    className="modal respawn-modal"
                    style={ { display: 'block' } }
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-sm-12">
                                        { this.renderCauseOfDeath() }
                                    </div>
                                </div>

                                <hr />

                                <h4 className="text-center">Respawning in { this.state.elapsed } seconds</h4>

                                <hr />

                                <p className="text-center">Share this link to play with friends.</p>
                                <input
                                    className="form-control text-center"
                                    defaultValue={ shareLink }
                                    readOnly
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="modal-backdrop fade in"
                    style={ { display: 'block' } }
                ></div>
            </div>
        )
    }
}

RespawnModal.propTypes = {
    isOpen: PropTypes.bool,
    player: PropTypes.object,
    room: PropTypes.object
}
