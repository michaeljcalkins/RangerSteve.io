import React, { PropTypes } from 'react'

export default function HudLeaderboard({
    players
}) {
    function renderPlayers() {
        return players
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player, index) {
                return (
                    <tr key={ index }>
                        <td>{ player.meta.nickname ? player.meta.nickname : 'Unamed Ranger' }</td>
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
    players: PropTypes.array.isRequired
}
