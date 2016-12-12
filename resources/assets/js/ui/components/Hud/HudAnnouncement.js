import React, { PropTypes } from 'react'

export default function HudAnnouncement({
    announcement,
}) {
    if (! announcement || ! announcement.trim().length) return

    return (
        <div className="hud-announcement no-pointer-events">
            <p className="alert">
                { announcement }
            </p>
        </div>
    )
}

HudAnnouncement.defaultProps = {
    announcement: '',
}

HudAnnouncement.propTypes = {
    onSendMessage: PropTypes.string,
}
