import React, { PropTypes } from 'react'

export default function HudLeaderboard({
    players
}) {
    function renderPlayers() {
        if (! players) return null
        let playersArray = Object.keys(players).map(playerId => players[playerId])
        return playersArray
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player, key) {
                return (
                    <tr key={ key }>
                        <td>
                            { player.meta.nickname
                                ? player.meta.nickname
                                : 'Unamed Ranger'
                            }
                        </td>
                        <td>{ player.meta.score }</td>
                    </tr>
                )
            })
    }

    return (
        <div className="hud-leaderboard hud-item">
            <h1>Leaderboard</h1>
            <table className="table table-condensed">
                <tbody>
                    { renderPlayers() }
                </tbody>
            </table>
        </div>
    )
}

HudLeaderboard.propTypes = {
    players: PropTypes.object.isRequired
}
