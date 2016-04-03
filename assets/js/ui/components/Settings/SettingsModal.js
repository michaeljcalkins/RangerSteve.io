import React, { PropTypes } from 'react'

export default function SettingsModal({
    isOpen,
    onClose,
    onSoundEffectVolumeChange,
    onNicknameChange
}) {
    function handleNicknameChange(evt) {
        onNicknameChange(evt.target.value)
    }

    function handleSoundEffectVolumeChange(evt) {
        onSoundEffectVolumeChange(evt.target.value)
    }

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
                            <label>Nickname</label>
                            <input
                                className="form-control"
                                onChange={ handleNicknameChange }
                                type="text"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Sound Effects Volume</label>
                            <input
                                max="1"
                                min="0"
                                step=".01"
                                type="range"
                                onChange={ handleSoundEffectVolumeChange }
                            />
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
