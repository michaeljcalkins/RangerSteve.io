import React, { PropTypes } from 'react'
import moment from 'moment'

export default class RespawnModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            elapsed: 0,
            roundEndTime: moment().add(15, 'seconds').valueOf()
        }
    }

    componentDidMount() {
        this.timer = setInterval(this.tick.bind(this), 100)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    tick() {
        const timeRemaining = this.state.roundEndTime - moment().valueOf()
        let seconds = Number((timeRemaining / 1000).toFixed(1))
        if (seconds % 1 === 0) seconds = seconds + '.0'

        if (isNaN(seconds) || seconds <= 0) {
            this.setState({ elapsed: 0 })
            return
        }

        this.setState({ elapsed: seconds })
    }

    render() {
        const { isOpen } = this.props
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
                                                <img className="media-object" src="https://placehold.it/60x60" />
                                            </div>
                                            <div className="media-body">
                                                <h4 className="media-heading">Silver Sanchez</h4>
                                                <strong><span className="text-danger">Killed you with their</span> <span className="text-primary">AK-47</span></strong><br />
                                                Damage taken: <strong>168</strong> in <strong>2 hits</strong> from Silver Sanchez<br />
                                                Damage given: <strong>11</strong> in <strong>1 hits</strong> to Silver Sanchez
                                            </div>
                                            <div className="media-right">
                                                <img className="media-object" height="45" style={{margin: '10px 0 0'}} src="/images/guns/Spr_AK47.png" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <h4 className="text-center">Respawning in { this.state.elapsed } seconds</h4>

                                <hr />

                                <p className="text-center">Share this link to invite friends to the current game.</p>
                                <input className="form-control text-center" type="text" defaultValue={ shareLink } />
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
}

RespawnModal.propTypes = {
    isOpen: PropTypes.boolean
}
