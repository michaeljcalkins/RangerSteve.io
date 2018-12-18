import React, { PureComponent } from "react";
import PropTypes from "prop-types";

export default class HudTimer extends PureComponent {
  static propTypes = {
    secondsRemaining: PropTypes.number.isRequired
  };

  static defaultProps = {
    secondsRemaining: 0
  };

  getRemainingTimeText(secondsRemaining) {
    if (secondsRemaining <= 0) return "0:00";

    const minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining - minutes * 60;
    seconds = `0${seconds}`.substr(-2);

    return `${minutes}:${seconds}`;
  }

  render() {
    const { secondsRemaining } = this.props;

    return <div className="hud-timer hud-item">{this.getRemainingTimeText(secondsRemaining)}</div>;
  }
}
