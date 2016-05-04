import React, { PropTypes } from 'react'

export default function HudJumpJet({
    jumpJetCounter
}) {
    function percent(counter) {
        let percent = 100

        if (counter < 0) {
            percent = 100 - ((counter * -1) / 130000 * 100).toFixed(0)
            percent = percent < 0 ? 0 : percent
        }

        return percent
    }

    const widthPercent = percent(jumpJetCounter) + '%'

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
