import React, { PropTypes } from 'react'
import cs from 'classnames'

import DefaultView from './DefaultView'
import ChoosePrimaryView from './ChoosePrimaryView'
import ChooseSecondaryView from './ChooseSecondaryView'
import ControlsView from './ControlsView'

export default function SettingsModal({
    game,
    isOpen,
    onClose,
    onKeyboardControlChange,
    onNicknameChange,
    onPrimaryGunClick,
    onQualityChange,
    onSecondaryGunClick,
    onSetResetEventsFlag,
    onSfxVolumeChange,
    onViewChange,
    player,
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
                    onQualityChange={ onQualityChange }
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
                className="modal modal-settings"
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
                                                active: game.settingsView === 'default',
                                            }) }
                                        >
                                            <a onClick={ onViewChange.bind(this, 'default') }>
                                                Weapons and Settings
                                            </a>
                                        </li>
                                        <li
                                            className={ cs({
                                                pointer: true,
                                                active: game.settingsView === 'controls',
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
                className="modal-backdrop"
                style={ { display: isOpen ? 'block' : 'none' } }
             />
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
    onQualityChange: PropTypes.func.isRequired,
    onSecondaryGunClick: PropTypes.func,
    onSoundEffectVolumeChange: PropTypes.func,
    onViewChange: PropTypes.func,
    player: PropTypes.object,
    selectedPrimaryWeapon: PropTypes.string,
    selectedSecondaryWeapon: PropTypes.string,
    settingsView: PropTypes.string,
}
