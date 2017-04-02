import autobind from 'react-autobind'
import React, { PureComponent, PropTypes } from 'react'
import get from 'lodash/get'
import cs from 'classnames'

import GameConsts from 'lib/GameConsts'
import Client from '../../../lib/Client'
import getPlayerWithBestAccuracy from '../../../lib/getPlayerWithBestAccuracy'
import getPlayerWithBestHeadshots from '../../../lib/getPlayerWithBestHeadshots'
import getPlayerWithBestKillingSpree from '../../../lib/getPlayerWithBestKillingSpree'
import getPlayerWithBestKillsPerMinute from '../../../lib/getPlayerWithBestKillsPerMinute'

const { object } = PropTypes

export default class LeaderboardModal extends PureComponent {
  static propTypes = {
    room: object.isRequired
  }

  constructor (props) {
    super(props)
    autobind(this)
  }

  state = {
    elapsed: 0
  }

  componentDidMount () {
    this.timer = setInterval(this.tick.bind(this), 100)
    Client.send(GameConsts.EVENT.PLAYER_SCORES)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  tick () {
    const { currentTime, roundStartTime } = this.props.room
    let timeRemaining = (roundStartTime / 1000) - (currentTime / 1000)
    let seconds = Number((timeRemaining).toFixed(1))
    seconds = seconds % 1 === 0
      ? seconds + '.0'
      : seconds

    if (Number(seconds) < 0) seconds = '0.0'

    this.setState({ elapsed: `${seconds}` })
  }

  renderPlayers () {
    const { players, room } = this.props

    return players
      .map((player, key) => {
        const { headshots, deaths, kills, score, nickname: playerNickname = 'Unnamed Ranger', id, team } = player
        const kdRatio = deaths > 0 ? (kills / deaths) : kills
        const headshotsPerKill = kills > 0 ? (headshots / kills).toFixed(1) : 0
        const classes = cs({
          'text-red': team === 'red' && room.gamemode === 'TeamDeathmatch',
          'text-blue': team === 'blue' && room.gamemode === 'TeamDeathmatch',
          'active': id === window.SOCKET_ID
        })

        return (
          <tr
            className={classes}
            key={'leaderboard-' + key + playerNickname}
          >
            <td className='text-right'>{ key + 1 }</td>
            <td>
              { player.isPremium &&
                <img src='/images/icons/gold-crown.png' width='15' className='mr1' style='margin-top: -4px' />
              }
              { playerNickname }
            </td>
            <td>{ score || 0 }</td>
            <td>{ kills || 0 }</td>
            <td>{ deaths || 0 }</td>
            <td>{ headshotsPerKill }</td>
            <td>{ kdRatio ? kdRatio.toFixed(2) : 0 }</td>
          </tr>
        )
      })
  }

  renderFirstPlacePlayerName () {
    const { players } = this.props

    return get(players, '[0].nickname')
  }

  renderPlayerAchievement (playerMeta, award) {
    if (!playerMeta) {
      return (
        <div className='player-achievement'>
          <h2>--</h2>
          <h6>{ award }</h6>
          <h4>--</h4>
        </div>
      )
    }

    const score = get(playerMeta, 'score', 0)
    const nickname = get(playerMeta, 'nickname', 'Unnamed Ranger')

    return (
      <div className='player-achievement'>
        <h2>{ score }</h2>
        <h6>{ award }</h6>
        <h4>{ nickname }</h4>
      </div>
    )
  }

  renderWinningPlayerOrTeam () {
    const { room } = this.props

    const winningPhrase = room.state === 'ended'
      ? 'wins!'
      : 'in the lead.'

    switch (room.gamemode) {
      case 'Deathmatch':
      case 'Pointmatch':
        return (
          <div className='winning-player'>
            <div className='player-name'>{ this.renderFirstPlacePlayerName() } { winningPhrase }</div>
          </div>
        )

      case 'TeamDeathmatch':
        const winningTeamName = room.redTeamScore > room.blueTeamScore
          ? 'Red'
          : 'Blue'

        const classes = cs('winning-player', {
          'red-winning': room.redTeamScore > room.blueTeamScore,
          'blue-winning': room.redTeamScore < room.blueTeamScore
        })

        if (room.redTeamScore === room.blueTeamScore) {
          return (
            <div className='winning-player'>
              <div className='player-name'>Teams Are Tied.</div>
            </div>
          )
        }

        return (
          <div className={classes}>
            <div className='player-name'>{ winningTeamName } Team { winningPhrase }</div>
          </div>
        )
    }
  }

  render () {
    const {
      state: { elapsed },
      props: { room, player }
    } = this

    const playerWithBestAccuracy = getPlayerWithBestAccuracy(room)
    const playerWithBestHeadshots = getPlayerWithBestHeadshots(room)
    const playerWithKillingSpree = getPlayerWithBestKillingSpree(room)
    const playerWithBestKillsPerMinute = getPlayerWithBestKillsPerMinute(room)

    return (
      <div>
        <div className='modal modal-leaderboard show'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h4 className='modal-title'>Leaderboard</h4>
              </div>
              <div className='modal-body'>
                <div className='row' style={{ marginBottom: '15px' }}>
                  <div className='col-xs-5'>
                    { this.renderWinningPlayerOrTeam() }
                  </div>
                  <div className='col-xs-7'>
                    { this.renderPlayerAchievement(playerWithBestHeadshots, 'Most headshots') }
                    { this.renderPlayerAchievement(playerWithBestAccuracy, 'Most accurate') }
                    { this.renderPlayerAchievement(playerWithKillingSpree, 'Longest kill streak') }
                    { this.renderPlayerAchievement(playerWithBestKillsPerMinute, 'Best kills per minute') }
                  </div>
                </div>
                { !player.isPremium &&
                  <a
                    className='btn btn-success btn-block mb3 btn-lg'
                    href='/buy'
                    v-if='!isPremium'
                  >
                    <img
                      src='/images/icons/gold-crown.png'
                      width='30'
                      className='mr1'
                      style='margin-top: -4px'
                    />
                    Buy Premium For Access To All Guns!
                  </a>
                }
                <table className='table table-condensed tcw'>
                  <thead>
                    <tr>
                      <th />
                      <th>Player</th>
                      <th>Score</th>
                      <th>Kills</th>
                      <th>Deaths</th>
                      <th>Headshots per Kill</th>
                      <th>K/D Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.renderPlayers() }
                  </tbody>
                </table>
                { room.state === 'ended' &&
                  <div className='row'>
                    <div className='col-xs-12 text-center'>
                      <h5>Next round starting in { elapsed } seconds...</h5>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className='modal-backdrop show' />
      </div>
    )
  }
}
