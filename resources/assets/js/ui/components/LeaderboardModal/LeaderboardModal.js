// probably should copy and paste into your own text editor
import autobind from 'react-autobind' // import decorator
import React, { Component, PropTypes } from 'react' // trailing commas are removed by babel;; good convention to adopt
import { get, values } from 'lodash'
import moment from 'moment'
import cs from 'classnames'

const { object } = PropTypes

export default class Leaderboard extends Component {
    static propTypes = {
        room: object.isRequired
    }

    constructor(props) {
        super(props)
        autobind(this)
    }

    state = {
        elapsed: 0
    }

    componentDidMount() {
        this.timer = setInterval(() => this.tick, 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    tick() {
        const { setState, props: { room } } = this
        let timeRemaining = room.roundStartTime - moment().unix()
        let minutes = Math.floor(timeRemaining / 60)
        let seconds = timeRemaining - minutes * 60

        if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
            return '0'
        }

        setState({ elapsed: `${seconds}` })
    }

    // { name: 'Most damage inflicted', playerNickname: 'Rick Sanchez', pic: 'path/to/over9000.jpeg' },

    renderAchievements() {
        const { props: { room } } = this

        let playerWithBestHeadshots = {}
        Object.keys(room.players).forEach((player) => {
            if (room.players[player].meta.headshots > get(playerWithBestHeadshots, 'meta.headshots', 0)) {
                playerWithBestHeadshots = room.players[player]
            }
        })

        let playerWithBestAggresion = {}
        Object.keys(room.players).forEach((player) => {
            if (room.players[player].meta.aggression > get(playerWithBestAggresion, 'meta.aggression', 0)) {
                playerWithBestAggresion = room.players[player]
            }
        })

        let playerWithBestAccuracy = {}
        Object.keys(room.players).forEach((player) => {
            if (room.players[player].meta.bulletsFired === 0) return

            // bullets fired / bullets that hit
            const accuracy = room.players[player].meta.bulletsHit / room.players[player].meta.bulletsFired
            room.players[player].meta.accuracy = accuracy

            if (room.players[player].meta.accuracy > get(playerWithBestAccuracy, 'meta.accuracy', 0)) {
                playerWithBestAccuracy = room.players[player]
            }
        })

        // Has to wait for the next room update before refreshing values
        let playerWithBestMovement = {}
        Object.keys(room.players).forEach((player) => {
            if (room.players[player].meta.movement > get(playerWithBestMovement, 'meta.movement', 0)) {
                playerWithBestMovement = room.players[player]
            }
        })

        return (
            <div>
                <div className="player-achievement">
                    <img src="/images/icons/headshot.png" />
                    <h6>Most headshots</h6>
                    <h4>{ playerWithBestHeadshots.meta ? playerWithBestHeadshots.meta.nickname : '--' }</h4>
                </div>
                <div className="player-achievement">
                    <img src="/images/icons/dog.png" />
                    <h6>Most aggressive</h6>
                    <h4>{ playerWithBestAggresion.meta ? playerWithBestAggresion.meta.nickname : '--' }</h4>
                </div>
                <div className="player-achievement">
                    <img src="/images/icons/dog.png" />
                    <h6>Most accurate</h6>
                    <h4>{ playerWithBestAccuracy.meta ? playerWithBestAccuracy.meta.nickname : '--' }</h4>
                </div>
                <div className="player-achievement">
                    <img src="/images/icons/movement.png" />
                    <h6>Most movement</h6>
                    <h4>{ playerWithBestMovement.meta ? playerWithBestMovement.meta.nickname : '--' }</h4>
                </div>
            </div>
        )
    }

    renderPlayers() {
        const { room } = this.props
        return values(room.players)
            .sort((a, b) => a.meta.score < b.meta.score)
            .map((player, key) => {
                const { meta: { deaths, kills, score, nickname: playerNickname = 'Unnamed Ranger' }, id } = player
                const kdRatio = deaths > 0 ? (kills / deaths) : kills
                const classes = cs({
                    'active-player': id === window.socket.id
                })

                return (
                    <tr
                        className={ classes }
                        key={ 'leaderboard-' + key + playerNickname }
                    >
                        <td>
                            { playerNickname }
                        </td>
                        <td>{ score }</td>
                        <td>{ kills }</td>
                        <td>{ deaths }</td>
                        <td>{ kdRatio.toFixed(2) }</td>
                    </tr>
                )
            })
    }

    renderFirstPlacePlayerName() {
        const { room } = this.props

        const players = values(room.players)
            .sort((a, b) => a.meta.score < b.meta.score)

        return get(players, '[0].meta.nickname')
    }

    render() {
        let { state: { elapsed }, props: { room }, renderPlayers, renderAchievements } = this

        return (
            <div>
                <div
                    className="modal modal-leaderboard"
                    style={ { display: 'block' } }
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Leaderboard</h4>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-sm-5">
                                        <div className="winning-player">
                                            <div className="player-image"></div>
                                            <div className="player-name">{ this.renderFirstPlacePlayerName() }</div>
                                        </div>
                                    </div>
                                    <div className="col-sm-7">
                                        { renderAchievements() }
                                    </div>
                                </div>
                                <table className="table table-condensed">
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>Score</th>
                                            <th>Kills</th>
                                            <th>Deaths</th>
                                            <th>K/D Ratio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { renderPlayers() }
                                    </tbody>
                                </table>
                                { room.state === 'ended' &&
                                    <div className="row">
                                        <div className="col-sm-12 text-center">
                                            <h5>Next round starting in { elapsed } seconds...</h5>
                                        </div>
                                    </div>
                                }
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
