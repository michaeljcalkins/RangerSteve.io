import React, { Component, PropTypes } from 'react'
import autobind from 'react-autobind'
import get from 'lodash/get'

import GameConsts from 'lib/GameConsts'

export default class HudPointmatchScore extends Component {
  constructor (props) {
    super(props)
    autobind(this)
  }

  static propTypes = {
    players: PropTypes.array.isRequired
  }

  static defaultProps = {
    players: []
  }

  render () {
    const { players } = this.props

    const highscorePlayer = get(players, '[0].score', 0) > 0
      ? players[0]
      : { nickname: '--', score: 0 }

    return (
      <div className='hud-pointmatch hud-item'>
        { highscorePlayer.nickname } - { highscorePlayer.score }/{ GameConsts.POINTMATCH_END_ROUND_ON_SCORE }
      </div>
    )
  }
}
