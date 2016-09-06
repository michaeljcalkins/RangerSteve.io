import React, { PropTypes } from 'react'
import _ from 'lodash'
import moment from 'moment'

export default class EndOfRoundLeaderboard extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            elapsed: 0
        }

        this.renderPlayers = this.renderPlayers.bind(this)
        this.tick = this.tick.bind(this)
    }

    componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    tick() {
        let timeRemaining = this.props.roundStartTime - moment().unix()
        var minutes = Math.floor(timeRemaining / 60)
        var seconds = timeRemaining - minutes * 60

        if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
            return '0'
        }

        this.setState({ elapsed: `${seconds}` })
    }

    renderPlayers() {
        return _.values(this.props.players)
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player, key) {
                let kdRatio = player.meta.deaths > 0 ? player.meta.kills / player.meta.deaths : player.meta.kills
                return (
                    <tr key={ key }>
                        <td>
                            { player.meta.nickname
                                ? player.meta.nickname
                                : 'Unnamed Ranger'
                            }
                        </td>
                        <td>{ player.meta.score }</td>
                        <td>{ player.meta.kills }</td>
                        <td>{ player.meta.deaths }</td>
                        <td>{ kdRatio.toFixed(2) }</td>
                        <td>{ player.meta.bestKillingSpree }</td>
                    </tr>
                )
            })
    }

    render() {
        return (
            <div className="end-of-round-leaderboard hud-item">
                <h1>Leaderboard</h1>
                <table className="table table-condensed">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Kills</th>
                            <th>Deaths</th>
                            <th>K/D Ratio</th>
                            <th>Best Killing Spree</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.renderPlayers() }
                    </tbody>
                </table>
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <span>Next round starting in { this.state.elapsed } seconds...</span>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Most Shots Fired
                    </div>
                    <div className="col-sm-3">
                        Most Accurate
                    </div>
                    <div className="col-sm-3">
                        Most Movement
                    </div>
                    <div className="col-sm-3">
                        Lived the longest
                    </div>
                </div>
            </div>
        )
    }
}

EndOfRoundLeaderboard.propTypes = {
    players: PropTypes.object,
    roundStartTime: PropTypes.number
}
