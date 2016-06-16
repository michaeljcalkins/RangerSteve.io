import React, { PropTypes } from 'react'

export default function RespawnModal({
    isOpen,
    onClose
}) {
    const shareLink = window.location.href

    return (
        <div>
            <div
                className="modal respawn-modal"
                style={ { display: isOpen ? 'block' : 'none' } }
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="media" style={ { margin: '0 0 10px' } }>
                                        <div className="media-left">
                                            <img className="media-object" src="https://placehold.it/50x50" />
                                        </div>
                                        <div className="media-body">
                                            <h4 className="media-heading">Silver Sanchez</h4>
                                            <strong><span className="text-danger">Killed you with their</span> <span className="text-primary">AK-47</span></strong>
                                        </div>
                                        <div className="media-right">
                                            <img className="media-object" src="/images/guns/Spr_AK47.png" />
                                        </div>
                                    </div>

                                    <p>
                                        Damage taken: <strong>168</strong> in <strong>2 hits</strong> from Silver Sanchez<br />
                                        Damage given: <strong>11</strong> in <strong>1 hits</strong> to Silver Sanchez
                                    </p>
                                </div>
                            </div>
                            <div style={ { margin: '5px 0 25px' } }>
                                <span>Respawning in...</span>
                                <div className="progress">
                                    <div className="progress-bar progress-bar-danger" style={ { width: '10%' } }>5.6s</div>
                                </div>
                            </div>
                            <hr />
                            <p className="text-center">Share this link to invite friends to the current game.</p>
                            <input className="form-control" type="text" defaultValue={ shareLink } />
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal-backdrop fade in"
                style={ { display: isOpen ? 'block' : 'none' } }
            ></div>
        </div>
    )
}

RespawnModal.propTypes = {
    isOpen: PropTypes.boolean,
    onClose: PropTypes.func
}
