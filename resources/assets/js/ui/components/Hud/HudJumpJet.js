import React, { PropTypes } from 'react'

import RemainingFuelPercent from '../../../lib/RemainingFuelPercent'

export default function HudJumpJet({
    jumpJetCounter
}) {
    const widthPercent = RemainingFuelPercent(jumpJetCounter) + '%'

    return (
        <div className="hud-jump-jet hud-item">
            <div className="progress">
                <div
                    className="progress-bar progress-bar-success"
                    style={ { width: widthPercent } }
                ></div>
            </div>
        </div>
    )
}

HudJumpJet.propTypes = {
    jumpJetCounter: PropTypes.number.isRequired
}
