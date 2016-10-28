import React, { PropTypes } from 'react'
import _ from 'lodash'

export default function HudLeaderboard({
    players,
}) {
    function renderPlayers() {
        if (! players) return null



        return _.values(players)
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player, key) {
                let playerNickname = player.meta.nickname
                    ? player.meta.nickname
                    : 'Unnamed Ranger'

                const killingSpreeCount = player.meta.killingSpree > 1
                    ? `${player.meta.killingSpree}x `
                    : null

                return (
                    <tr key={ key }>
                        <td title="Player's nickname" style={ { width: '120px', overflow: 'hidden' } }>{ playerNickname }</td>
                        <td title="Player's current killing spree" style={ { width: '20px' } }><strong>{ killingSpreeCount }</strong></td>
                        <td title="Player's current score" style={ { width: '20px' } }>{ player.meta.score }</td>
                    </tr>
                )
            })
    }

    return (
        <div className="hud-leaderboard hud-item">
            <h1>Scoreboard</h1>
            <table className="table table-condensed">
                <tbody>
                    { renderPlayers() }
                </tbody>
            </table>
        </div>
    )
}

HudLeaderboard.propTypes = {
    players: PropTypes.object
}
