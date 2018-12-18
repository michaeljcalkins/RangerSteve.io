import React from "react";
import cs from "classnames";
import PropTypes from "prop-types";

import WeaponStats from "./WeaponStats";

export default function WeaponButton({ onClick, weapon, disabled }) {
  function renderWeaponImage() {
    if (!weapon) return null;
    return <img src={"/images/guns/large/" + weapon.image} />;
  }

  if (!weapon) return null;

  const classes = cs({
    "option-group option-group-lg option-character-group align-middle": true,
    "option-disabled": disabled
  });

  const onClickHandler = disabled ? () => null : onClick;

  return (
    <div className={classes} id="open-primary-weapon-menu-button" onClick={onClickHandler}>
      <div>{renderWeaponImage()}</div>
      <span className="option-name">{weapon.name}</span>
      <WeaponStats weapon={weapon} />
    </div>
  );
}
