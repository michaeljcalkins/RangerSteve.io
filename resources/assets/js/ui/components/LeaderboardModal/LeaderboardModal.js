import autobind from 'react-autobind'
import React, { PureComponent, PropTypes } from 'react'
import values from 'lodash/values'
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
    room: object.isRequired,
  }

  constructor(props) {
    super(props)
    autobind(this)
  }

  state = {
    elapsed: 0,
  }

  componentDidMount() {
    this.timer = setInterval(this.tick.bind(this), 100)
    Client.send(GameConsts.EVENT.PLAYER_SCORES)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  tick() {
    const { room } = this.props
    const currentTime = Math.floor(Date.now() / 1000)
    let timeRemaining = room.roundStartTime - currentTime
    let minutes = Math.floor(timeRemaining / 60)
    let seconds = timeRemaining - minutes * 60

    if (isNaN(minutes) || isNaN(seconds) || minutes < 0) return '0'

    this.setState({ elapsed: `${seconds}` })
  }

  renderPlayers() {
    const { room } = this.props

    if (! room.players) return null

    return values(room.players)
      .sort((a, b) => a.score < b.score)
      .map((player, key) => {
        const { headshots, deaths, kills, score, nickname: playerNickname = 'Unnamed Ranger', id } = player
        const kdRatio = deaths > 0 ? (kills / deaths) : kills
        const headshotsPerKill = kills > 0 ? (headshots / kills).toFixed(1) : 0
        const classes = cs({
          'active-player': id === window.SOCKET_ID,
        })

        return (
          <tr
              className={ classes }
              key={ 'leaderboard-' + key + playerNickname }
          >
            <td className="text-right">{ key + 1 }</td>
            <td>{ playerNickname }</td>
            <td>{ score || 0 }</td>
            <td>{ kills || 0 }</td>
            <td>{ deaths || 0 }</td>
            <td>{ headshotsPerKill }</td>
            <td>{ kdRatio ? kdRatio.toFixed(2) : 0 }</td>
          </tr>
        )
      })
  }

  renderFirstPlacePlayerName() {
    const { room } = this.props

    if (! room.players) return null

    const players = values(room.players)
      .sort((a, b) => a.score < b.score)

    return get(players, '[0].nickname')
  }

  renderPlayerAchievement(playerMeta, award) {
    if (! playerMeta) {
      return (
        <div className="player-achievement">
          <h2>--</h2>
          <h6>{ award }</h6>
          <h4>--</h4>
        </div>
      )
    }

    const score = playerMeta.score
    const nickname = playerMeta.nickname ? playerMeta.nickname : 'Unnamed Ranger'

    return (
      <div className="player-achievement">
        <h2>{ score }</h2>
        <h6>{ award }</h6>
        <h4>{ nickname }</h4>
      </div>
    )
  }

  renderWinningPlayerOrTeam() {
    const { room } = this.props

    const winningPhrase = room.state === 'ended'
      ? 'wins!'
      : 'in the lead.'

    switch (room.gamemode) {
    case 'Deathmatch':
      return (
          <div className="winning-player">
            <div className="player-name">{ this.renderFirstPlacePlayerName() } { winningPhrase }</div>
          </div>
        )

    case 'TeamDeathmatch':
      const winningTeamName = room.redTeamScore > room.blueTeamScore
          ? 'Red'
          : 'Blue'

      const classes = cs('winning-player', {
        'red-winning': room.redTeamScore > room.blueTeamScore,
        'blue-winning': room.redTeamScore < room.blueTeamScore,
      })

      if (room.redTeamScore === room.blueTeamScore) {
        return (
            <div className="winning-player">
              <div className="player-name">Teams Are Tied.</div>
            </div>
          )
      }

      return (
          <div className={ classes }>
            <div className="player-name">{ winningTeamName } Team { winningPhrase }</div>
          </div>
        )
    }
  }

  render() {
    const {
      state: { elapsed },
      props: { room },
    } = this

    const playerWithBestAccuracy = getPlayerWithBestAccuracy(room)
    const playerWithBestHeadshots = getPlayerWithBestHeadshots(room)
    const playerWithKillingSpree = getPlayerWithBestKillingSpree(room)
    const playerWithBestKillsPerMinute = getPlayerWithBestKillsPerMinute(room)

    return (
      <div>
        <div className="modal modal-leaderboard show">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Leaderboard</h4>
              </div>
              <div className="modal-body">

                <div className="row" style={ { marginBottom: '15px' } }>
                  <div className="col-sm-5">
                    { this.renderWinningPlayerOrTeam() }
                  </div>
                  <div className="col-sm-7">
                    { this.renderPlayerAchievement(playerWithBestHeadshots, 'Most headshots') }
                    { this.renderPlayerAchievement(playerWithBestAccuracy, 'Most accurate') }
                    { this.renderPlayerAchievement(playerWithKillingSpree, 'Longest kill streak') }
                    { this.renderPlayerAchievement(playerWithBestKillsPerMinute, 'Best kills per minute') }
                  </div>
                </div>
                <table className="table table-condensed">
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
                  <div className="row">
                    <div className="col-sm-12 text-center">
                      <h5>Next round starting in { elapsed } seconds...</h5>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop show" />
      </div>
    )
  }
}
