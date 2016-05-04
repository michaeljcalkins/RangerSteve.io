import React, { PropTypes } from 'react'

export default function Hudhealth({
    health
}) {
    return (
        <div className="hud-health hud-item">{ health }</div>
    )
}
