import React, { PropTypes } from 'react'

export default function SettingsModal({
    isOpen,
    onClose
}) {
    let modalStyles =  {
        display: isOpen ? 'block' : ''
    }

    return (
        <div className="modal hud-settings-modal" style={ modalStyles }>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button
                            onClick={ onClose }
                            type="button"
                            className="close">
                            <span>&times;</span>
                        </button>
                        <h4 className="modal-title">Settings</h4>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="">Nickname</label>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Sound Effects Volume</label>
                            <input type="range"/>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-default"
                            onClick={ onClose }>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

SettingsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired
}
