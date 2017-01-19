import React, { PureComponent, PropTypes } from 'react'
import upperCase from 'lodash/upperCase'

export default class HudTeamScore extends PureComponent {
  static propTypes = {
    score1: PropTypes.number.isRequired,
    score2: PropTypes.number.isRequired
  }

  static defaultProps = {
    score1: 0,
    score2: 0
  }

  render () {
    return (
      <div className='hud-team-score hud-item'>
        <div className='hud-team-score-1'>{ this.props.score1 }</div>
        <div className='hud-team-score-2'>{ this.props.score2 }</div>
      </div>
    )
  }
}
