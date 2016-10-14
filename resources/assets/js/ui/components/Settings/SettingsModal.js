import React, { PropTypes } from 'react'
import cs from 'classnames'

import DefaultView from './DefaultView'
import ChoosePrimaryView from './ChoosePrimaryView'
import ChooseSecondaryView from './ChooseSecondaryView'
import ControlsView from './ControlsView'

export default function SettingsModal({
    isOpen,
    onClose,
    onViewChange,
    onNicknameChange,
    onPrimaryGunClick,
    onSecondaryGunClick,
    onSfxVolumeChange,
    onKeyboardControlChange,
    onSetResetEventsFlag,
    player,
    game
}) {
    function renderModalView() {
        switch (game.settingsView) {
        case 'choosePrimary':
            return (
                <ChoosePrimaryView
                    onPrimaryGunClick={ onPrimaryGunClick }
                    onViewChange={ onViewChange }
                />
            )

        case 'chooseSecondary':
            return (
                <ChooseSecondaryView
                    onSecondaryGunClick={ onSecondaryGunClick }
                    onViewChange={ onViewChange }
                />
            )

        case 'controls':
            return (
                <ControlsView
                    game={ game }
                    onKeyboardControlChange={ onKeyboardControlChange }
                    onSetResetEventsFlag={ onSetResetEventsFlag }
                    onViewChange={ onViewChange }
                />
            )

        default:
            return (
                <DefaultView
                    game={ game }
                    onNicknameChange={ onNicknameChange }
                    onSfxVolumeChange={ onSfxVolumeChange }
                    onViewChange={ onViewChange }
                    player={ player }
                />
            )
        }
    }

    return (
        <div>
            <div
                className="modal"
                style={ { display: isOpen ? 'block' : 'none' } }
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button
                                className="close"
                                onClick={ onClose }
                                type="button"
                            >
                                <span>&times;</span>
                            </button>
                            <h4 className="modal-title">Settings</h4>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-12 text-center">
                                    <ul className="nav nav-pills" style={ { marginBottom: '15px', display: 'inline-block' } }>
                                        <li
                                            className={ cs({
                                                pointer: true,
                                                active: game.settingsView === 'main'
                                            }) }
                                        >
                                            <a onClick={ onViewChange.bind(this, 'main') }>
                                                Main
                                            </a>
                                        </li>
                                        <li
                                            className={ cs({
                                                pointer: true,
                                                active: game.settingsView === 'controls'
                                            }) }
                                        >
                                            <a onClick={ onViewChange.bind(this, 'controls') }>
                                                Controls
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            { renderModalView() }
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

SettingsModal.propTypes = {
    defaultNicknameValue: PropTypes.string,
    defaultSoundEffectValue: PropTypes.number,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onNicknameChange: PropTypes.func,
    onPrimaryGunClick: PropTypes.func,
    onSecondaryGunClick: PropTypes.func,
    onSoundEffectVolumeChange: PropTypes.func,
    onViewChange: PropTypes.func,
    player: PropTypes.object,
    selectedPrimaryWeapon: PropTypes.string,
    selectedSecondaryWeapon: PropTypes.string,
    settingsView: PropTypes.string
}
