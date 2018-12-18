import React from "react";
import PropTypes from "prop-types";

export default function HudSettingsButton({ onButtonClick }) {
  return (
    <div className="hud-settings-button hud-item" onClick={onButtonClick}>
      Settings
    </div>
  );
}

HudSettingsButton.propTypes = {
  onButtonClick: PropTypes.func.isRequired
};
