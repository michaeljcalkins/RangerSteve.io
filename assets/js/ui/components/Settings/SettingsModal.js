import React, { PropTypes } from 'react'

export default function SettingsModal({
    isOpen,
    onClose,
    onSoundEffectVolumeChange,
    onNicknameChange,
    defaultNicknameValue,
    defaultSoundEffectValue
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
                                defaultValue={ defaultNicknameValue }
                                type="text"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Sound Effects Volume</label>
                            <input
                                defaultValue={ defaultSoundEffectValue }
                                max="1"
                                min="0"
                                onChange={ handleSoundEffectVolumeChange }
                                step=".01"
                                type="range"
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
