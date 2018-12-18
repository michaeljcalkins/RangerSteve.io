import React, { Component } from "react";
import autobind from "react-autobind";
import PropTypes from "prop-types";

import GameConsts from "lib/GameConsts";

export default class HudPointmatchScore extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static propTypes = {
    player: PropTypes.object.isRequired
  };

  static defaultProps = {
    player: {}
  };

  render() {
    const { player } = this.props;

    return (
      <div className="hud-pointmatch hud-item">
        {player.nickname} - {player.score}/{GameConsts.POINTMATCH_END_ROUND_ON_SCORE}
      </div>
    );
  }
}
