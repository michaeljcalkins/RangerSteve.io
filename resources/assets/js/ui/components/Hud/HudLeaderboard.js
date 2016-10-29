import React, { PropTypes } from 'react'
import _ from 'lodash'
import cs from 'classnames'

export default function HudLeaderboard({
    room,
}) {
    function renderPlayers() {
        if (! room.players) return null

        return _.values(room.players)
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player) {
                let playerNickname = player.meta.nickname
                    ? player.meta.nickname
                    : 'Unnamed Ranger'

                const killingSpreeCount = player.meta.killingSpree > 1
                    ? `${player.meta.killingSpree}x `
                    : null

                const classes = cs({
                    'text-danger': player.meta.team === 'red' && room.gamemode === 'TeamDeathmatch',
                    'text-info': player.meta.team === 'blue' && room.gamemode === 'TeamDeathmatch',
                })

                return (
                    <tr className={ classes } key={ player.meta.id }>
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
    room: PropTypes.object
}
