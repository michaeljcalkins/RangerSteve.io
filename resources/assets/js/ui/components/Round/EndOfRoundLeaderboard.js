import React, { PropTypes } from 'react'

export default function EndOfRoundLeaderboard({
    players
}) {
    function renderPlayers() {
        return players
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player, index) {
                let kdRatio = player.meta.deaths > 0 ? player.meta.kills / player.meta.deaths : player.meta.kills
                return (
                    <tr key={ index }>
                        <td>
                            { player.meta.nickname
                                ? player.meta.nickname
                                : 'Unamed Ranger'
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

    return (
        <div className="end-of-round-leaderboard hud-item">
            <h1>Leaderboard</h1>
            <table className="table table-condensed">
                <thead>
                    <tr>
                        <th></th>
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
        </div>
    )
}

EndOfRoundLeaderboard.propTypes = {
    players: PropTypes.array.isRequired
}
