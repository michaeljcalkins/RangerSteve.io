import React, { Component, PropTypes } from 'react'
import autobind from 'react-autobind'
import { values, get } from 'lodash'

import GameConsts from 'lib/GameConsts'

export default class HudHighScore extends Component {
  constructor (props) {
    super(props)
    autobind(this)
  }

  static propTypes = {
    players: PropTypes.object.isRequired
  }

  static defaultProps = {
    players: {}
  }

  getHighscorePlayer () {
    const { players } = this.props

    const sortedPlayers = values(players)
      .sort((a, b) => a.score < b.score)

    return get(sortedPlayers, '[0].score', 0) > 0
      ? sortedPlayers[0]
      : { nickname: '--', score: 0 }
  }

  render () {
    const highscorePlayer = this.getHighscorePlayer()

    return (
      <div className='hud-pointmatch hud-item'>
        { highscorePlayer.nickname } - { highscorePlayer.score }/{ GameConsts.POINTMATCH_END_ROUND_ON_SCORE }
      </div>
    )
  }
}
