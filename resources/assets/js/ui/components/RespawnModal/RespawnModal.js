import React, { PropTypes } from 'react'
import moment from 'moment'
import _ from 'lodash'
import cs from 'classnames'

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

        const attackingPlayerName = _.get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const defendingHits = _.get(player, 'attackingDamageStats.attackingHits')
        const defendingDamage = _.get(player, 'attackingDamageStats.attackingDamage')

        return (
            <div>
                <strong className="text-success">Damage given:</strong> <strong>{ defendingDamage }</strong> in <strong>{ defendingHits } hits</strong> to { attackingPlayerName }
            </div>
        )
    }

    renderDamageTaken() {
        const { player, room } = this.props

        if (! player.damageStats) return null

        const attackingPlayerName = _.get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const attackingHits = _.get(player, 'damageStats.attackingHits')
        const attackingDamage = _.get(player, 'damageStats.attackingDamage')

        return (
            <div>
                <strong className="text-danger">Damage taken:</strong> <strong>{ attackingDamage }</strong> in <strong>{ attackingHits } hits</strong> from { attackingPlayerName }
                <br />
            </div>
        )
    }

    renderCauseOfDeath() {
        const { player, room } = this.props
        const attackingPlayerName = _.get(room, `players[${player.damageStats.attackingPlayerId}].meta.nickname`, 'Enemy Player')
        const selectedWeapon = _.get(GameConsts, `WEAPONS[${player.damageStats.weaponId}]`)
        const attackingPlayerId = _.get(player, 'damageStats.attackingPlayerId', false)

        if (! attackingPlayerId) {
            return (
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <h4>You killed yourself...</h4>
                    </div>
                </div>
            )
        }

        return (
            <div className="row">
                <div className="col-sm-12 text-center">
                    <img
                        className="weapon-image"
                        src={ '/images/guns/large/' + selectedWeapon.image }
                    />
                    <h4><strong>{ attackingPlayerName }</strong> killed you with their <strong>{ selectedWeapon.name }</strong></h4>
                    { this.renderDamageTaken() }
                    { this.renderDamageGiven() }
                </div>
            </div>
        )
    }

    render() {
        const { player } = this.props
        const attackingPlayerId = _.get(player, 'damageStats.attackingPlayerId', false)
        const shareLink = window.location.href
        const encodedShareLink = encodeURIComponent(shareLink)
        const modalContentClasses = cs('modal-content', {
            'modal-content-suicide': ! attackingPlayerId
        })

        return (
            <div>
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
                                <div className="row">
                                    <div className="col-sm-12">
                                        { this.renderCauseOfDeath() }
                                    </div>
                                </div>

                                <h4 className="text-center">Respawning in { this.state.elapsed } seconds</h4>

                                <hr />

                                <div className="row">
                                    <div className="col-sm-12 text-center">
                                        <p className="text-center">Invite people into this game.</p>
                                        <a
                                            href={ 'https://www.facebook.com/sharer/sharer.php?u=' + encodedShareLink }
                                            target="_blank"
                                        >
                                            <img className="social-image" src="/images/icons/facebook-3-128.png" />
                                        </a>
                                        &nbsp;
                                        <a
                                            href={ 'https://twitter.com/home?status=' + encodedShareLink }
                                            target="_blank"
                                        >
                                            <img className="social-image" src="/images/icons/twitter-3-128.png" />
                                        </a>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-12 text-center">
                                        <p className="text-center">Direct link to this game.</p>
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
                    </div>
                </div>
                <div
                    className="modal-backdrop"
                    style={ { display: 'block' } }
                ></div>
            </div>
        )
    }
}

RespawnModal.propTypes = {
    player: PropTypes.object,
    room: PropTypes.object
}
