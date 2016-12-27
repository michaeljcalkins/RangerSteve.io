import React, { PropTypes } from 'react'
import values from 'lodash/values'
import cs from 'classnames'
import { connect } from 'react-redux'

export class HudLeaderboard extends React.PureComponent {
    renderPlayers() {
        const { players, gamemode } = this.props
        if (! players) return null

        return values(players)
            .sort((a, b) => a.meta.score < b.meta.score)
            .map(function(player) {
                let playerNickname = player.meta.nickname
                    ? player.meta.nickname
                    : 'Unnamed Ranger'

                const killingSpreeCount = player.meta.killingSpree > 1
                    ? `${player.meta.killingSpree}x `
                    : null

                const classes = cs({
                    'text-red': player.meta.team === 'red' && gamemode === 'TeamDeathmatch',
                    'text-blue': player.meta.team === 'blue' && gamemode === 'TeamDeathmatch',
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
    players: PropTypes.object,
    gamemode: PropTypes.string,
}

const mapStateToProps = (state) => {
    return {
        players: state.room.players,
        gamemode: state.room.gamemode,
    }
}

const HudLeaderboardContainer = connect(
    mapStateToProps,
    null,
)(HudLeaderboard)

export default HudLeaderboardContainer
