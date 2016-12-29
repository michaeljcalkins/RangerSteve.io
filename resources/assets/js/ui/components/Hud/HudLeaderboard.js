import React, { PropTypes } from 'react'
import values from 'lodash/values'
import cs from 'classnames'
import { connect } from 'react-redux'

export class HudLeaderboard extends React.Component {
    renderPlayers() {
        const { room } = this.props
        if (! room.players) return null

        return values(room.players)
            .sort((a, b) => a.score < b.score)
            .map(function(player) {
                let playerNickname = player.nickname
                    ? player.nickname
                    : 'Unnamed Ranger'

                const killingSpreeCount = player.killingSpree > 1
                    ? `${player.killingSpree}x `
                    : null

                const classes = cs({
                    'text-red': player.team === 'red' && room.gamemode === 'TeamDeathmatch',
                    'text-blue': player.team === 'blue' && room.gamemode === 'TeamDeathmatch',
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
                            { player.score || 0 }
                        </td>
                    </tr>
                )
            })
    }

    render() {
        return (
            <div className="hud-leaderboard hud-item no-pointer-events">
                <h1>Scoreboard</h1>
                <table className="table table-condensed">
                    <tbody>
                        { this.renderPlayers() }
                    </tbody>
                </table>
            </div>
        )
    }
}

HudLeaderboard.propTypes = {
    room: PropTypes.object,
}

const mapStateToProps = (state) => {
    return {
        room: state.room,
    }
}

const HudLeaderboardContainer = connect(
    mapStateToProps,
    null,
)(HudLeaderboard)

export default HudLeaderboardContainer
