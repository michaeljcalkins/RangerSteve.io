import React, { PropTypes } from 'react'

import MainSettingsMenu from './MainSettingsMenu'
import ChoosePrimaryMenu from './ChoosePrimaryMenu'
import ChooseSecondaryMenu from './ChooseSecondaryMenu'
import ChooseCharacterMenu from './ChooseCharacterMenu'

export default class SettingsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            view: 'main'
        }

        this.handleViewChange = this.handleViewChange.bind(this)
    }

    renderOptionsView() {
        switch(this.state.view) {
        case 'main':
            return (
                <MainSettingsMenu
                    defaultNicknameValue={ this.props.defaultNicknameValue }
                    defaultSoundEffectValue={ this.props.defaultSoundEffectValue }
                    onNicknameChange={ this.props.onNicknameChange }
                    onSoundEffectVolumeChange={ this.props.onSoundEffectVolumeChange }
                    onViewChange={ this.handleViewChange }
                />
            )
        case 'choosePrimary':
            return (
                <ChoosePrimaryMenu
                    onViewChange={ this.handleViewChange }
                />
            )
        case 'chooseSecondary':
            return (
                <ChooseSecondaryMenu
                    onViewChange={ this.handleViewChange }
                />
            )
        case 'chooseCharacter':
            return (
                <ChooseCharacterMenu
                    onViewChange={ this.handleViewChange }
                />
            )
        }
    }

    handleViewChange(view) {
        this.setState({ view })
    }

    render() {
        const { isOpen, onClose } = this.props

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
                            <h4 className="modal-title">Options</h4>
                        </div>
                        <div className="modal-body">
                            { this.renderOptionsView() }
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
}

SettingsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired
}
