import React, { PropTypes } from 'react'

export default function HudJumpJet({
    jumpJetCounter
}) {
    let percent = 100

    if (jumpJetCounter < 0) {
        percent = 100 - ((jumpJetCounter * -1) / 90000 * 100).toFixed(0)
        percent = percent < 0 ? 0 : percent
    }

    return (
        <div className="hud-jump-jet hud-item">
            <div className="progress">
                <div className="progress-bar progress-bar-success" style={ { width: percent + '%' } }></div>
            </div>
        </div>
    )
}

HudJumpJet.propTypes = {
    jumpJetCounter: PropTypes.number.isRequired
}
