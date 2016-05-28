import React, { PropTypes } from 'react'
import moment from 'moment'

export default function HudTimer({
    roundEndTime
}) {
    function formatTime() {
        let timeRemaining = roundEndTime - moment().unix()
        var minutes = Math.floor(timeRemaining / 60)
        var seconds = timeRemaining - minutes * 60
        seconds = `0${seconds}`.substr(-2)

        if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
            return '0:00'
        }

        return `${minutes}:${seconds}`
    }

    return (
        <div className="hud-timer hud-item">{ formatTime() }</div>
    )
}

HudTimer.propTypes = {
    roundEndTime: PropTypes.number
}
