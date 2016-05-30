import React, { PropTypes } from 'react'
import _ from 'lodash'
import moment from 'moment'

export default function EndOfRoundLeaderboard({
    players,
    roundStartTime
}) {
    function renderPlayers() {
        return _.values(players)
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
                        <td>{ kdRatio }</td>
                        <td>{ player.meta.bestKillingSpree }</td>
                    </tr>
                )
            })
    }

    function formatTime() {
        let timeRemaining = roundStartTime - moment().unix()
        var minutes = Math.floor(timeRemaining / 60)
        var seconds = timeRemaining - minutes * 60

        if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
            return '0'
        }

        return `${seconds}`
    }

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
                    { renderPlayers() }
                </tbody>
            </table>
            <div className="row">
                <div className="col-sm-12 text-center">
                    <span>Next round starting in { formatTime() } seconds...</span>
                </div>
            </div>
        </div>
    )
}

EndOfRoundLeaderboard.propTypes = {
    players: PropTypes.object,
    roundStartTime: PropTypes.number
}
