import React, { PropTypes } from 'react'
import moment from 'moment'
import _ from 'lodash'

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
        const { player } = this.props

        if (! _.get(player, 'attackingDamageStats.attackingDamage')) return null

        return (
            <div>
                Damage given: <strong>{ player.attackingDamageStats.attackingDamage }</strong> in <strong>{ player.attackingDamageStats.attackingHits } hits</strong> to { player.damageStats.attackingPlayerId }
            </div>
        )
    }

    renderDamageTaken() {
        const { player } = this.props

        if (! player.damageStats) return null

        return (
            <div>
                Damage taken: <strong>{ player.damageStats.attackingDamage }</strong> in <strong>{ player.damageStats.attackingHits } hits</strong> from { player.damageStats.attackingPlayerId }<br />
            </div>
        )
    }

    renderCauseOfDeath() {
        const { player } = this.props

        if (! _.get(player, 'damageStats.attackingPlayerId')) {
            return (
                <div className="media" style={ { margin: '0 0 10px' } }>
                    <div className="media-left">
                        <img className="media-object" src="/images/icons/skull-32-black.png" />
                    </div>
                    <div className="media-body">
                        <h4 className="media-heading" style={ { margin: '7px 0 0' } }>You killed yourself...</h4>
                    </div>
                </div>
            )
        }

        return (
            <div className="media" style={ { margin: '0 0 10px' } }>
                <div className="media-left">
                    <img className="media-object" src="https://placehold.it/60x60" />
                </div>
                <div className="media-body">
                    <h4 className="media-heading">{ player.damageStats.attackingPlayerId }</h4>
                    <strong><span className="text-danger">Killed you with their</span> <span className="text-primary">{ player.damageStats.weaponId }</span></strong><br />
                    { this.renderDamageTaken() }
                    { this.renderDamageGiven() }
                </div>
            </div>
        )
    }

    render() {
        const { isOpen } = this.props
        const shareLink = window.location.href

        return (
            <div>
                <div
                    className="modal respawn-modal"
                    style={ { display: isOpen ? 'block' : 'none' } }
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

                                <p className="text-center">Share this link to invite friends to the current game.</p>
                                <input
                                    className="form-control text-center"
                                    type="text"
                                    defaultValue={ shareLink }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="modal-backdrop fade in"
                    style={ { display: isOpen ? 'block' : 'none' } }
                ></div>
            </div>
        )
    }
}

RespawnModal.propTypes = {
    isOpen: PropTypes.bool,
    player: PropTypes.object
}
