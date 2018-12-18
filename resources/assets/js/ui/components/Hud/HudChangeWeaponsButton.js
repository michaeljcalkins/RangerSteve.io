import React from "react";
import PropTypes from "prop-types";

export default function HudChangeWeaponsButton({ onButtonClick }) {
  return (
    <div className="hud-change-weapons-button hud-item" onClick={onButtonClick}>
      Weapons
    </div>
  );
}

HudChangeWeaponsButton.propTypes = {
  onButtonClick: PropTypes.func.isRequired
};
