import React, { PureComponent, PropTypes } from 'react'

export default class HudAnnouncement extends PureComponent {
  render() {
    const {announcement} = this.props
    if (!announcement || !announcement.trim().length) return

    return (
            <div className="hud-announcement no-pointer-events">
                <p className="alert">
                    { announcement }
                </p>
            </div>
        )
  }
}

HudAnnouncement.defaultProps = {
  announcement: '',
}

HudAnnouncement.propTypes = {
  onSendMessage: PropTypes.string,
}
