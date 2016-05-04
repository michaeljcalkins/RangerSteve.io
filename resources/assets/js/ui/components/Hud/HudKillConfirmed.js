import React, { PropTypes } from 'react'

export default function HudKillConfirmed({
    showKillConfirmed
}) {
    if (!showKillConfirmed) return null

    return (
        <div className="hud-kill-confirmed">+10</div>
    )
}
