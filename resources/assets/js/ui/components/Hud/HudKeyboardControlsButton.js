import React from "react";
import PropTypes from "prop-types";

export default function HudKeyboardControlsButton({ onButtonClick }) {
  return (
    <div className="hud-keyboard-controls-button hud-item" onClick={onButtonClick}>
      Controls
    </div>
  );
}

HudKeyboardControlsButton.propTypes = {
  onButtonClick: PropTypes.func.isRequired
};
