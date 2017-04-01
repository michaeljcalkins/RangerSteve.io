import React, { Component, PropTypes } from 'react'
import cs from 'classnames'
import { connect } from 'react-redux'

export class HudLeaderboard extends Component {
  renderPlayers () {
    const { room, players } = this.props

    return players.map(player => {
      let playerNickname = player.nickname
        ? player.nickname
        : 'Unnamed Ranger'

      const killingSpreeCount = player.killingSpree > 1
        ? `${player.killingSpree}x `
        : null

      const playerRowClasses = cs({
        'text-red': player.team === 'red' && room.gamemode === 'TeamDeathmatch',
        'text-blue': player.team === 'blue' && room.gamemode === 'TeamDeathmatch',
        'active': player.id === window.SOCKET_ID
      })

      return (
        <tr key={player.id} className={playerRowClasses}>
          <td
            style={{ width: '120px', overflow: 'hidden' }}
            title="Player's nickname"
          >
            { player.isPremium &&
              <img
                src='/images/icons/gold-crown.png'
                width='15'
                class='mr1'
                style='margin-top: -4px'
              />
            }
            { playerNickname }
          </td>
          <td
            style={{ width: '20px' }}
            title="Player's current killing spree"
          >
            <strong>{ killingSpreeCount }</strong>
          </td>
          <td
            style={{ width: '20px' }}
            title="Player's current score"
          >
            { player.score || 0 }
          </td>
        </tr>
      )
    })
  }

  render () {
    return (
      <div className='hud-leaderboard hud-item no-pointer-events'>
        <h1>Leaderboard</h1>
        <table className='table table-condensed'>
          <tbody>
            { this.renderPlayers() }
          </tbody>
        </table>
      </div>
    )
  }
}

HudLeaderboard.propTypes = {
  room: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    room: state.room
  }
}

const HudLeaderboardContainer = connect(
    mapStateToProps,
    null,
)(HudLeaderboard)

export default HudLeaderboardContainer
