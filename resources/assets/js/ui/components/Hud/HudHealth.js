import React, { PropTypes } from 'react'

export default function HudHealth({
    health,
}) {
  return (
        <div className="hud-health hud-item">{ health }</div>
    )
}

HudHealth.propTypes = {
  health: PropTypes.number.isRequired,
}
