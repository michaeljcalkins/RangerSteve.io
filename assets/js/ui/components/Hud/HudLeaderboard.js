import React, { PropTypes } from 'react'

export default function HudLeaderboard({
    players
}) {
    function renderPlayersListItems() {
        let sortedPlayers = players
            .sort(function(a, b) {
                return a.meta.score < b.meta.score
            })
            .slice(0, 9)
            
        return sortedPlayers.map((player, index) => {
            return (
                <li key={ index }>
                    { player.meta.nickname ? player.meta.nickname : 'Unamed Ranger' }
                </li>
            )
        })
    }

    return (
        <div className="hud-leaderboard hud-item">
            <h1>Leaderboard</h1>
            <ol>
                { renderPlayersListItems() }
            </ol>
        </div>
    )
}

HudLeaderboard.propTypes = {
    players: PropTypes.array.isRequired
}
