import React, { PropTypes } from 'react'
import values from 'lodash/values'
import cs from 'classnames'

export default function HudLeaderboard({
    room,
}) {
    function renderPlayers() {
        if (! room.players) return null

        return values(room.players)
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player) {
                let playerNickname = player.meta.nickname
                    ? player.meta.nickname
                    : 'Unnamed Ranger'

                const killingSpreeCount = player.meta.killingSpree > 1
                    ? `${player.meta.killingSpree}x `
                    : null

                const classes = cs({
                    'text-red': player.meta.team === 'red' && room.gamemode === 'TeamDeathmatch',
                    'text-blue': player.meta.team === 'blue' && room.gamemode === 'TeamDeathmatch',
                })

                return (
                    <tr key={ player.id }>
                        <td
                            className={ classes }
                            style={ { width: '120px', overflow: 'hidden' } }
                            title="Player's nickname"
                        >
                            { playerNickname }
                        </td>
                        <td
                            style={ { width: '20px' } }
                            title="Player's current killing spree"
                        >
                            <strong>{ killingSpreeCount }</strong>
                        </td>
                        <td
                            style={ { width: '20px' } }
                            title="Player's current score"
                        >
                            { player.meta.score }
                        </td>
                    </tr>
                )
            })
    }

    return (
        <div className="hud-leaderboard hud-item no-pointer-events">
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
    room: PropTypes.object,
}
