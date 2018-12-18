import React, { PureComponent } from "react";
import PropTypes from "prop-types";

export default class HudHealth extends PureComponent {
  static propTypes = {
    health: PropTypes.number.isRequired
  };

  static defaultProps = {
    health: 0
  };

  render() {
    return <div className="hud-health hud-item">{this.props.health}</div>;
  }
}
