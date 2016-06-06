import React, { PropTypes } from 'react'

export default function HudScore({
    score
}) {
    return (
        <div className="hud-score hud-item">{ score }</div>
    )
}

HudScore.propTypes = {
    score: PropTypes.number.isRequired
}
